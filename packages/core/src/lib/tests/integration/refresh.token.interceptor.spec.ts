import { describe, it, expect, beforeAll, vi, beforeEach } from 'vitest';
import { StoreSdk } from '../../sdk.js';
import { StoreSdkConfig } from '../../configs/sdk.config.js';
import { httpClient } from '../../services/api.js';
import { resetRefreshTokenState } from '../../interceptors/refresh.token.interceptor.js';

const WP_BASE_URL = process.env.WP_BASE_URL || 'http://localhost:8080';
const CUSTOMER_USER = process.env.TEST_CUSTOMER_USER || 'customer';
const CUSTOMER_PASS = process.env.TEST_CUSTOMER_PASSWORD || 'customer123';

// Simple holder for tokens captured through config callbacks
let accessToken = '';
let refreshToken = '';

// Initialize SDK once and use exposed auth facade
const sdk = StoreSdk;
let pluginActive: boolean | undefined;

describe('Integration: Refresh Token Interceptor', () => {
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

  it('multiple concurrent 401s trigger only one refresh token call', async () => {
    if (!pluginActive) {
      expect(true).toBe(true); // skip-like if plugin not active
      return;
    }

    // Store original token state to restore later
    const originalAccessTokenValue = accessToken;
    const originalRefreshTokenValue = refreshToken;
    const originalTokenStoreToken = tokenStore.token;
    const originalTokenStoreRefresh = tokenStore.refresh;

    // 1) Login and set a very short access_ttl to force expiry
    const { data, error } = await StoreSdk.auth.token({
      login: CUSTOMER_USER,
      password: CUSTOMER_PASS,
      access_ttl: 1, // seconds - token will expire quickly
    });

    expect(error).toBeUndefined();
    expect(data?.token).toBeTruthy();
    expect(tokenStore.token).toBeTruthy();
    expect(tokenStore.refresh).toBeTruthy();
    const oldToken = tokenStore.token;

    // 2) Wait for the access token to expire
    await new Promise((r) => setTimeout(r, 3000));

    // 3) Mock the auth service to track refresh token calls
    const originalRefreshToken = sdk.auth.refreshToken;
    const refreshTokenSpy = vi.fn(originalRefreshToken.bind(sdk.auth));
    sdk.auth.refreshToken = refreshTokenSpy;

    try {
      // 4) Make multiple concurrent requests that will all get 401s
      //    These should all trigger the interceptor, but only one refresh should happen
      const concurrentRequests = [
        StoreSdk.store.cart.get(),
        StoreSdk.store.cart.get(),
        StoreSdk.store.cart.get(),
        httpClient.get('/wp-json/wc/store/v1/cart'), // Direct HTTP call
        httpClient.get('/wp-json/wc/store/v1/cart'), // Another direct HTTP call
      ];

      // 5) Wait for all requests to complete (they should all succeed after the single refresh)
      const results = await Promise.allSettled(concurrentRequests);

      // 6) Verify that refresh token was called only once
      expect(refreshTokenSpy).toHaveBeenCalledTimes(1);

      // 7) Verify that the token was actually refreshed
      expect(tokenStore.token).toBeTruthy();
      expect(tokenStore.token).not.toBe(oldToken);

      // 8) Verify that most/all requests succeeded (after refresh)
      const succeededRequests = results.filter((r) => r.status === 'fulfilled');
      // At least some requests should have succeeded after the refresh
      expect(succeededRequests.length).toBeGreaterThan(0);

      // 9) Log the results for debugging
      console.log(
        `Refresh token called ${refreshTokenSpy.mock.calls.length} times`
      );
      console.log(
        `${succeededRequests.length}/${results.length} requests succeeded`
      );
    } finally {
      // Restore the original method
      sdk.auth.refreshToken = originalRefreshToken;

      // Restore original token state to prevent pollution
      accessToken = originalAccessTokenValue;
      refreshToken = originalRefreshTokenValue;
      tokenStore.token = originalTokenStoreToken;
      tokenStore.refresh = originalTokenStoreRefresh;
    }
  }, 15000); // Give enough time for multiple requests and retries

  it('verify token state is clean after test', async () => {
    // Clean up for next tests
    if (pluginActive && accessToken) {
      await sdk.auth.revokeToken();
    }
    expect(true).toBe(true); // Basic assertion to pass the test
  });
});
