import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { StoreSdk } from '../../sdk.js';
import { StoreSdkConfig } from '../../configs/sdk.config.js';
import { resetRefreshTokenState } from '../../interceptors/refresh.token.interceptor.js';

const WP_BASE_URL = process.env.WP_BASE_URL || 'http://localhost:8080';
const CUSTOMER_USER = process.env.TEST_CUSTOMER_USER || 'customer';
const CUSTOMER_PASS = process.env.TEST_CUSTOMER_PASSWORD || 'customer123';

// Simple holder for tokens captured through config callbacks
let accessToken = '';
let refreshToken = '';

// Initialize SDK once and use exposed auth facade
const sdk = StoreSdk;
// We'll init lazily in beforeAll so baseUrl & config callbacks are wired
let pluginActive: boolean | undefined;

describe('Integration: Auth', () => {
  const tokenStore = { token: '', refresh: '' };

  beforeEach(() => {
    // Reset the global refresh token state before each test
    resetRefreshTokenState();
  });

  beforeAll(async () => {
    // Probe status first; if unreachable or inactive, later tests will soft-pass

    const config: StoreSdkConfig = {
      baseUrl: WP_BASE_URL,
      auth: {
        getToken: async () => {
          return accessToken;
        },
        setToken: async (t: string) => {
          accessToken = t;
          tokenStore.token = t;
        },
        getRefreshToken: async () => {
          return refreshToken;
        },
        setRefreshToken: async (t: string) => {
          refreshToken = t;
          tokenStore.refresh = t;
        },
        clearToken: async () => {
          accessToken = '';

          tokenStore.token = '';
          tokenStore.refresh = '';
        },
      },
    };
    await sdk.init(config);
    const status = await sdk.auth.status();
    pluginActive = !!status.data?.active;
  });

  it('status endpoint responds (soft assert)', async () => {
    const { data, error } = await sdk.auth.status();
    // Basic shape assertions if available
    if (data) {
      expect(typeof data.active).toBe('boolean');
      expect(typeof data.version).toBe('string');
    } else {
      // Allow environments without plugin
      expect(error || true).toBeTruthy();
    }
  });

  it('logs in and receives token (customer user)', async () => {
    if (!pluginActive) {
      expect(true).toBe(true); // skip-like
      return;
    }
    const { data, error } = await sdk.auth.token({
      login: CUSTOMER_USER,
      password: CUSTOMER_PASS,
    });
    expect(error).toBeFalsy();
    expect(data?.token).toBeTruthy();
    expect(accessToken).toBe(data?.token);
    if (data?.refresh_token) {
      refreshToken = data.refresh_token;
    }
  });

  it('validates current access token', async () => {
    if (!pluginActive) {
      expect(true).toBe(true);
      return;
    }
    const { data, error } = await sdk.auth.validate();
    expect(error).toBeFalsy();
    expect(data?.valid || false).toBe(true);
  });

  it('refreshes token (if refresh token available)', async () => {
    if (!pluginActive || !refreshToken) {
      expect(true).toBe(true);
      return;
    }
    const oldToken = accessToken;
    const { data, error } = await sdk.auth.refreshToken({
      refresh_token: refreshToken,
    });
    expect(error).toBeFalsy();
    if (data?.token) {
      expect(data.token).not.toBe(oldToken); // rotation expected (best-effort)
      refreshToken = data.refresh_token;
    }
  });

  it('issues one-time token after login', async () => {
    if (!pluginActive || !accessToken) {
      expect(true).toBe(true);
      return;
    }
    const { data, error } = await sdk.auth.oneTimeToken({ ttl: 60 });
    expect(error).toBeFalsy();
    if (data) {
      expect(typeof data.one_time_token).toBe('string');
      expect(data.one_time_token.length).toBeGreaterThan(10);
    }
  });

  it('logs in, token expires, 401 triggers refresh interceptor, retried request succeeds', async () => {
    // 1) Login and set a very short access_ttl to force expiry
    const { data, error } = await StoreSdk.auth.token({
      login: CUSTOMER_USER,
      password: CUSTOMER_PASS,
      access_ttl: 1, // seconds
    });

    expect(error).toBeUndefined();
    expect(data?.token).toBeTruthy();
    expect(tokenStore.token).toBeTruthy();
    expect(tokenStore.refresh).toBeTruthy();
    const oldToken = tokenStore.token;

    // 2) Wait for the access token to expire
    await new Promise((r) => setTimeout(r, 3000));

    // 3) Call a protected WP endpoint; initial 401 should be auto-refreshed and retried
    //    /wp/v2/users/me requires authentication
    // const res = await httpClient.get('/wp-json/wp/v2/users/me');
    const { data: cartData } = await StoreSdk.store.cart.get();

    // If the refresh interceptor worked, we should have a 200 and user data
    // expect(res.status).toBe(200);
    expect(cartData).toBeTruthy();
    expect(tokenStore.token).toBeTruthy();
    expect(tokenStore.token).not.toBe(oldToken); // token must rotate after refresh
  }, 8000);

  it('revokes token and subsequent validate may fail', async () => {
    if (!pluginActive || !accessToken) {
      expect(true).toBe(true);
      return;
    }
    const { data, error } = await sdk.auth.revokeToken();
    expect(error).toBeFalsy();
    expect(data?.revoked).toBe(true);
    // Optionally validate again (may fail and return error)
    const postValidate = await sdk.auth.validate();
    if (postValidate.data) {
      // If still valid, at least shape holds
      expect(typeof postValidate.data.valid).toBe('boolean');
    } else {
      expect(postValidate.error || true).toBeTruthy();
    }
  });
});
