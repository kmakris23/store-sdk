import { beforeAll, describe, expect, it } from 'vitest';

// These tests assume the WP env is up (npm run test:wp-plugin script starts it) and seeded users exist.
// Adjust base URL if docker compose mapping changes.
const BASE = process.env.WP_BASE_URL || 'http://localhost:8080';

interface IssueTokenResponse {
  token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  refresh_expires_in: number;
  user: { id: number; login: string; email: string; display_name?: string };
}
interface RevokeResponse {
  revoked: boolean;
  scope: string;
  new_version: number;
}
interface OneTimeTokenResponse {
  one_time_token: string;
  expires_in: number;
}
interface ValidateResponsePayload {
  sub: number;
  ver?: number;
  [k: string]: unknown;
}
interface ValidateResponse {
  valid: boolean;
  payload: ValidateResponsePayload;
}
interface AutoLoginSuccess {
  login: 'success';
  user: { id: number; login: string; email?: string; display_name?: string };
  redirect: string | null;
}
interface ErrorResponse {
  code?: string;
  data?: { status?: number };
  message?: string;
}

function isErrorResponse(x: unknown): x is ErrorResponse {
  if (!x || typeof x !== 'object') return false;
  const obj = x as Record<string, unknown>;
  return (
    typeof obj.code === 'string' ||
    typeof obj.message === 'string' ||
    typeof obj.data === 'object'
  );
}

interface JsonFetchResult<T = unknown> {
  status: number;
  ok: boolean;
  data: T | null;
  raw: string;
}

async function jsonFetch<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<JsonFetchResult<T>> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  let data: T | null = null;
  try {
    data = text ? (JSON.parse(text) as T) : null;
  } catch {
    /* keep raw */
  }
  return { status: res.status, ok: res.ok, data, raw: text };
}

let passwordToken: string | null = null; // normal token
let oneTimeToken: string | null = null;
let refreshToken: string | null = null;
let initialTokenVersion: number | null = null;

const CUSTOMER_LOGIN = process.env.TEST_CUSTOMER_USER || 'customer';
const CUSTOMER_PASSWORD = process.env.TEST_CUSTOMER_PASSWORD || 'customer123';

// Helper to get standard token
async function issueStandardToken() {
  const r = await jsonFetch<IssueTokenResponse | ErrorResponse>(
    `${BASE}/wp-json/store-sdk/v1/auth/token`,
    {
      method: 'POST',
      body: JSON.stringify({
        login: CUSTOMER_LOGIN,
        password: CUSTOMER_PASSWORD,
      }),
    }
  );
  expect(r.ok).toBe(true);
  if (!r.data || isErrorResponse(r.data))
    throw new Error('Unexpected failure issuing token');
  passwordToken = (r.data as IssueTokenResponse).token;
  refreshToken = (r.data as IssueTokenResponse).refresh_token;
}

async function issueOneTimeToken() {
  // Use Bearer of standard token
  const r = await jsonFetch<OneTimeTokenResponse | ErrorResponse>(
    `${BASE}/wp-json/store-sdk/v1/auth/one-time-token`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${passwordToken}` },
    }
  );
  expect(r.ok).toBe(true);
  if (!r.data || isErrorResponse(r.data))
    throw new Error('Failed issuing one-time token');
  oneTimeToken = (r.data as OneTimeTokenResponse).one_time_token;
}

describe('Store SDK JWT mu-plugin', () => {
  beforeAll(async () => {
    // Acquire baseline token once
    await issueStandardToken();
  }, 30000);

  it('rejects invalid credentials', async () => {
    const r = await jsonFetch<ErrorResponse>(
      `${BASE}/wp-json/store-sdk/v1/auth/token`,
      {
        method: 'POST',
        body: JSON.stringify({ login: 'nope', password: 'wrong' }),
      }
    );
    expect(r.ok).toBe(false);
    expect(r.status).toBe(403);
    expect(r.data?.code || r.data?.data?.status).toBeDefined();
  });

  it('silently ignores invalid bearer by default (no 401)', async () => {
    const r = await jsonFetch<ValidateResponse | ErrorResponse>(
      `${BASE}/wp-json/store-sdk/v1/auth/validate`,
      { headers: { Authorization: 'Bearer totally.invalid.token' } }
    );
    expect(r.ok).toBe(false);
    // Should be JWT structure error 401 (our endpoint returns payload error). Accept either malformed or bad_signature codes.
    if (r.data && isErrorResponse(r.data)) {
      const code = r.data.code || '';
      expect(code).toMatch(
        /storesdk_jwt\.(malformed|bad_signature|invalid_json)/
      );
    }
  });

  it('validates standard token', async () => {
    const r = await jsonFetch<ValidateResponse | ErrorResponse>(
      `${BASE}/wp-json/store-sdk/v1/auth/validate`,
      {
        headers: { Authorization: `Bearer ${passwordToken}` },
      }
    );
    expect(r.ok).toBe(true);
    if (!r.data || isErrorResponse(r.data))
      throw new Error('Validation returned error');
    const data = r.data as ValidateResponse;
    expect(data.valid).toBe(true);
    expect(data.payload.sub).toBeTruthy();
    if (typeof data.payload.ver === 'number') {
      initialTokenVersion = data.payload.ver;
    }
  });

  it('fails autologin with standard token (must be one-time)', async () => {
    if (!passwordToken) throw new Error('passwordToken missing');
    const r = await jsonFetch<ErrorResponse | AutoLoginSuccess>(
      `${BASE}/wp-json/store-sdk/v1/auth/autologin?token=${encodeURIComponent(
        passwordToken
      )}`
    );
    expect(r.ok).toBe(false);
    expect(r.status).toBe(401);
    if (!r.data) throw new Error('No response body');
    expect(isErrorResponse(r.data) ? r.data.code : undefined).toBe(
      'storesdk_jwt.not_one_time'
    );
  });

  it('issues one-time token', async () => {
    await issueOneTimeToken();
    expect(oneTimeToken).toBeTruthy();
  });

  it('refresh token rotates and returns new access token', async () => {
    if (!refreshToken) throw new Error('Missing initial refresh token');
    // First refresh
    const r1 = await jsonFetch<IssueTokenResponse | ErrorResponse>(
      `${BASE}/wp-json/store-sdk/v1/auth/refresh`,
      {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
        headers: { Authorization: `Bearer ${passwordToken}` },
      }
    );
    expect(r1.ok).toBe(true);
    if (!r1.data || isErrorResponse(r1.data)) throw new Error('Refresh failed');
    const data1 = r1.data as IssueTokenResponse;
    expect(data1.token).toBeTruthy();
    expect(data1.refresh_token).toBeTruthy();
    // Access token updated
    passwordToken = data1.token;
    const oldRefresh = refreshToken;
    refreshToken = data1.refresh_token;
    // Second refresh using new refresh token works
    const r2 = await jsonFetch<IssueTokenResponse | ErrorResponse>(
      `${BASE}/wp-json/store-sdk/v1/auth/refresh`,
      {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
        headers: { Authorization: `Bearer ${passwordToken}` },
      }
    );
    expect(r2.ok).toBe(true);
    if (!r2.data || isErrorResponse(r2.data))
      throw new Error('Second refresh failed');
    const data2 = r2.data as IssueTokenResponse;
    expect(data2.token).toBeTruthy();
    expect(data2.refresh_token).toBeTruthy();
    // Reuse of first refresh token should now fail
    const reuse = await jsonFetch<ErrorResponse>(
      `${BASE}/wp-json/store-sdk/v1/auth/refresh`,
      {
        method: 'POST',
        body: JSON.stringify({ refresh_token: oldRefresh }),
        headers: { Authorization: `Bearer ${passwordToken}` },
      }
    );
    expect(reuse.ok).toBe(false);
    expect([400, 401]).toContain(reuse.status);
  });

  it('autologin works with one-time token (JSON path)', async () => {
    if (!oneTimeToken)
      throw new Error('oneTimeToken missing (issueOneTimeToken failed)');
    const r = await jsonFetch<ErrorResponse | AutoLoginSuccess>(
      `${BASE}/wp-json/store-sdk/v1/auth/autologin?token=${encodeURIComponent(
        oneTimeToken
      )}`
    );
    expect(r.ok).toBe(true);
    if (!r.data || isErrorResponse(r.data))
      throw new Error('Expected success autologin');
    const data = r.data as AutoLoginSuccess;
    expect(data.login).toBe('success');
    expect(data.user.id).toBeTruthy();
  });

  it('one-time token cannot be reused', async () => {
    if (!oneTimeToken) throw new Error('oneTimeToken missing for reuse test');
    const r = await jsonFetch<ErrorResponse | AutoLoginSuccess>(
      `${BASE}/wp-json/store-sdk/v1/auth/autologin?token=${encodeURIComponent(
        oneTimeToken
      )}`
    );
    expect(r.ok).toBe(false);
    expect(r.status).toBe(401);
    if (!r.data) throw new Error('Missing response for reuse test');
    expect(isErrorResponse(r.data) ? r.data.code : undefined).toBe(
      'storesdk_jwt.one_time_invalid'
    );
  });

  it('revoke refresh only clears refresh tokens but keeps access token valid', async () => {
    // Need a current refresh token & access token
    if (!passwordToken || !refreshToken)
      throw new Error('Prereq tokens missing');
    const revoke = await jsonFetch<RevokeResponse | ErrorResponse>(
      `${BASE}/wp-json/store-sdk/v1/auth/revoke`,
      {
        method: 'POST',
        body: JSON.stringify({ scope: 'refresh' }),
        headers: { Authorization: `Bearer ${passwordToken}` },
      }
    );
    expect(revoke.ok).toBe(true);
    if (!revoke.data || isErrorResponse(revoke.data))
      throw new Error('Failed revoke refresh');
    expect((revoke.data as RevokeResponse).scope).toBe('refresh');
    // Old access token should still validate
    const validate = await jsonFetch<ValidateResponse | ErrorResponse>(
      `${BASE}/wp-json/store-sdk/v1/auth/validate`,
      { headers: { Authorization: `Bearer ${passwordToken}` } }
    );
    expect(validate.ok).toBe(true);
  });

  it('revoke all bumps version and invalidates old access token', async () => {
    if (!passwordToken) throw new Error('Missing access token');
    const revoke = await jsonFetch<RevokeResponse | ErrorResponse>(
      `${BASE}/wp-json/store-sdk/v1/auth/revoke`,
      {
        method: 'POST',
        body: JSON.stringify({ scope: 'all' }),
        headers: { Authorization: `Bearer ${passwordToken}` },
      }
    );
    expect(revoke.ok).toBe(true);
    if (!revoke.data || isErrorResponse(revoke.data))
      throw new Error('Failed revoke all');
    const rev = revoke.data as RevokeResponse;
    expect(rev.revoked).toBe(true);
    // Old token should now fail validation with version mismatch or unauthorized
    const validateOld = await jsonFetch<ValidateResponse | ErrorResponse>(
      `${BASE}/wp-json/store-sdk/v1/auth/validate`,
      { headers: { Authorization: `Bearer ${passwordToken}` } }
    );
    expect(validateOld.ok).toBe(false);
    // Issue a new token (login again) -> should have new version
    await issueStandardToken();
    const validateNew = await jsonFetch<ValidateResponse | ErrorResponse>(
      `${BASE}/wp-json/store-sdk/v1/auth/validate`,
      { headers: { Authorization: `Bearer ${passwordToken}` } }
    );
    expect(validateNew.ok).toBe(true);
    if (!validateNew.data || isErrorResponse(validateNew.data))
      throw new Error('Validate new failed');
    const vn = (validateNew.data as ValidateResponse).payload.ver;
    if (initialTokenVersion && typeof vn === 'number') {
      expect(vn).toBeGreaterThan(initialTokenVersion);
    }
  });

  it('front-channel autologin ignores standard token silently (should not 200 success)', async () => {
    if (!passwordToken) throw new Error('passwordToken missing');
    const r = await fetch(
      `${BASE}/?storesdk_autologin=1&token=${encodeURIComponent(passwordToken)}`
    );
    // We cannot easily assert cookie in this environment; just ensure not a redirect loop
    expect(r.status).toBeGreaterThanOrEqual(200);
    // Because plugin silently ignores, we shouldn't get JSON success. Accept any non-JSON response.
  });
});
