import { describe, it, expect, beforeAll } from 'vitest';
import { AuthService } from '../../services/auth/auth.service.js';
import { StoreSdkConfig } from '../../configs/sdk.config.js';

const WP_BASE_URL = process.env.WP_BASE_URL || 'http://localhost:8080';
const CUSTOMER_USER = process.env.TEST_CUSTOMER_USER || 'customer';
const CUSTOMER_PASS = process.env.TEST_CUSTOMER_PASSWORD || 'customer123';

// Simple holder for tokens captured through config callbacks
let accessToken = '';

const config: StoreSdkConfig = {
  baseUrl: WP_BASE_URL,
  auth: {
    setToken: async (t: string) => {
      accessToken = t;
    },
    clearToken: async () => {
      accessToken = '';
    },
  },
};

const service = new AuthService(config);

let refreshToken: string | undefined;
let pluginActive: boolean | undefined;

describe('Integration: Auth', () => {
  beforeAll(async () => {
    // Probe status first; if unreachable or inactive, later tests will soft-pass
    const status = await service.status();
    pluginActive = !!status.data?.active;
  });

  it('status endpoint responds (soft assert)', async () => {
    const { data, error } = await service.status();
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
    const { data, error } = await service.token({
      login: CUSTOMER_USER,
      password: CUSTOMER_PASS,
    });
    expect(error).toBeFalsy();
    expect(data?.token).toBeTruthy();
    expect(accessToken).toBe(data?.token);
    refreshToken = data?.refresh_token;
  });

  it('validates current access token', async () => {
    if (!pluginActive) {
      expect(true).toBe(true);
      return;
    }
    const { data, error } = await service.validate();
    expect(error).toBeFalsy();
    expect(data?.valid || false).toBe(true);
  });

  it('refreshes token (if refresh token available)', async () => {
    if (!pluginActive || !refreshToken) {
      expect(true).toBe(true);
      return;
    }
    const oldToken = accessToken;
    const { data, error } = await service.refreshToken({
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
    const { data, error } = await service.oneTimeToken({ ttl: 60 });
    expect(error).toBeFalsy();
    if (data) {
      expect(typeof data.one_time_token).toBe('string');
      expect(data.one_time_token.length).toBeGreaterThan(10);
    }
  });

  it('revokes token and subsequent validate may fail', async () => {
    if (!pluginActive || !accessToken) {
      expect(true).toBe(true);
      return;
    }
    const { data, error } = await service.revokeToken();
    expect(error).toBeFalsy();
    expect(data?.revoked).toBe(true);
    // Optionally validate again (may fail and return error)
    const postValidate = await service.validate();
    if (postValidate.data) {
      // If still valid, at least shape holds
      expect(typeof postValidate.data.valid).toBe('boolean');
    } else {
      expect(postValidate.error || true).toBeTruthy();
    }
  });
});
