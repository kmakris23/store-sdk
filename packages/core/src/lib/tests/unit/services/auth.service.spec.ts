import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
  type MockedFunction,
} from 'vitest';
import { StoreSdkConfig } from '../../../configs/sdk.config.js';
import { StoreSdk } from '../../../sdk.js';
import { EventBus } from '../../../bus/event.bus.js';
import { StoreSdkEvent } from '../../../sdk.events.js';
import { ApiError } from '../../../types/api.js';
import {
  AuthTokenRequest,
  AuthTokenResponse,
} from '../../../types/auth/token/index.js';
import { AuthRevokeResponse } from '../../../types/auth/revoke/index.js';
import {
  AuthOneTimeTokenRequest,
  AuthOneTimeTokenResponse,
} from '../../../types/auth/one-time-token/index.js';
import { AuthValidateResponse } from '../../../types/auth/validate/index.js';
import { AuthStatusResponse } from '../../../types/auth/status/index.js';

// Single source of truth for axios utility mocks (both relative and absolute import paths)
// Use vi.hoisted to avoid TDZ when Vitest hoists vi.mock calls
const axiosMockRefs = vi.hoisted(() => ({ doGet: vi.fn(), doPost: vi.fn() }));
vi.mock('../../../utilities/axios.utility.js', () => axiosMockRefs);
import { doGet, doPost } from '../../../utilities/axios.utility.js';

type AuthServiceType = InstanceType<
  typeof import('../../../services/auth/auth.service.js')['AuthService']
>;
describe('AuthService', () => {
  // AuthService instance (imported after mocks in beforeEach)
  let service: AuthServiceType;
  let config: StoreSdkConfig;
  let mockedGet: MockedFunction<typeof doGet>;
  let mockedPost: MockedFunction<typeof doPost>;
  const events = new EventBus<StoreSdkEvent>();

  const collectAuthEvents = () => {
    const received: { event: keyof StoreSdkEvent; payload?: unknown }[] = [];
    events.onAny((ev, payload) => {
      const key = ev as keyof StoreSdkEvent;
      if (key.startsWith('auth:')) {
        received.push({ event: key, payload });
      }
    });
    return received;
  };

  beforeEach(async () => {
    mockedGet = axiosMockRefs.doGet as unknown as MockedFunction<typeof doGet>;
    mockedPost = axiosMockRefs.doPost as unknown as MockedFunction<
      typeof doPost
    >;
    vi.clearAllMocks();
    // reset singleton state & events instead of reassigning object
    StoreSdk.state.cart = undefined;
    StoreSdk.state.authenticated = undefined;
    // clear and re-use internal EventBus (replace listeners)
    (StoreSdk as unknown as { events: EventBus<StoreSdkEvent> }).events =
      events;
    config = { baseUrl: 'https://example.com', auth: {} };
    const mod = await import('../../../services/auth/auth.service.js');
    const AuthService = mod.AuthService;
    // Use the shared StoreSdk.state so mutations are observable in assertions
    service = new AuthService(StoreSdk.state, config, events);
  });

  it('logs in and sets token, emits events, updates authenticated state', async () => {
    const setToken = vi.fn(async () => Promise.resolve());
    config.auth = { setToken };
    const tokenResponse: AuthTokenResponse = {
      token: 'abc123',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'r1',
      refresh_expires_in: 7200,
      user: { id: 1, login: 'u', email: 'e', display_name: 'U' },
    };
    mockedPost.mockResolvedValue({ data: tokenResponse });
    const evs = collectAuthEvents();

    const loginReq: AuthTokenRequest = { login: 'u', password: 'p' };
    const { data, error } = await service.token(loginReq);

    expect(error).toBeFalsy();
    expect(data).toEqual(tokenResponse);
    expect(setToken).toHaveBeenCalledWith('abc123');
    expect(StoreSdk.state.authenticated).toBe(true);
    const names = evs.map((e) => e.event);
    expect(names).toContain('auth:login:start');
    expect(names).toContain('auth:login:success');
    expect(names).toContain('auth:changed');
    expect(mockedPost.mock.calls[0][0]).toBe(
      '/wp-json/store-sdk/v1/auth/token'
    );
  });

  it('revoke before login when configured', async () => {
    const revokeResponse: AuthRevokeResponse = {
      revoked: true,
      scope: 's',
      new_version: 2,
    };
    const loginResponse: AuthTokenResponse = {
      token: 'zzz',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'r1',
      refresh_expires_in: 7200,
      user: { id: 1, login: 'u', email: 'e', display_name: 'U' },
    };
    config.auth = {
      revokeTokenBeforeLogin: true,
      setToken: vi.fn(async () => Promise.resolve()),
    };
    mockedPost
      .mockResolvedValueOnce({ data: revokeResponse }) // revoke
      .mockResolvedValueOnce({ data: loginResponse }); // login

    const { data } = await service.token({ login: 'u', password: 'p' });

    expect(data).toEqual(loginResponse);
    // first call revoke
    expect(mockedPost.mock.calls[0][0]).toBe(
      '/wp-json/store-sdk/v1/auth/revoke'
    );
    // second call login
    expect(mockedPost.mock.calls[1][0]).toBe(
      '/wp-json/store-sdk/v1/auth/token'
    );
  });

  it('login error emits error event and does not set authenticated', async () => {
    const apiError: ApiError = {
      code: 'bad_login',
      message: 'fail',
      data: { status: 403 },
      details: {},
    };
    mockedPost.mockResolvedValue({ error: apiError });
    const evs = collectAuthEvents();

    const { data, error } = await service.token({ login: 'u', password: 'p' });

    expect(data).toBeFalsy();
    expect(error).toEqual(apiError);
    expect(StoreSdk.state.authenticated).toBeFalsy();
    const names = evs.map((e) => e.event);
    expect(names).toContain('auth:login:start');
    expect(names).toContain('auth:login:error');
    expect(names).not.toContain('auth:login:success');
  });

  it('refresh token success updates token and emits events', async () => {
    const setToken = vi.fn(async () => Promise.resolve());
    config.auth = { setToken };
    const refreshResponse: AuthTokenResponse = {
      token: 'newT',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'r2',
      refresh_expires_in: 7200,
      user: { id: 1, login: 'u', email: 'e', display_name: 'U' },
    };
    mockedPost.mockResolvedValue({ data: refreshResponse });
    const evs = collectAuthEvents();

    const { data, error } = await service.refreshToken({ refresh_token: 'r1' });

    expect(error).toBeFalsy();
    expect(data).toEqual(refreshResponse);
    expect(setToken).toHaveBeenCalledWith('newT');
    expect(evs.map((e) => e.event)).toContain('auth:token:refresh:success');
    expect(mockedPost.mock.calls[0][0]).toBe(
      '/wp-json/store-sdk/v1/auth/refresh'
    );
  });

  it('refresh token error emits error event', async () => {
    const apiError: ApiError = {
      code: 'refresh_fail',
      message: 'fail',
      data: { status: 401 },
      details: {},
    };
    mockedPost.mockResolvedValue({ error: apiError });
    const evs = collectAuthEvents();

    const { data, error } = await service.refreshToken({ refresh_token: 'r1' });

    expect(data).toBeFalsy();
    expect(error).toEqual(apiError);
    const names = evs.map((e) => e.event);
    expect(names).toContain('auth:token:refresh:start');
    expect(names).toContain('auth:token:refresh:error');
  });

  it('revoke token clears token and emits events and updates state', async () => {
    const clearToken = vi.fn(async () => Promise.resolve());
    config.auth = { clearToken };
    mockedPost.mockResolvedValue({
      data: { revoked: true, scope: 's', new_version: 2 } as AuthRevokeResponse,
    });
    const evs = collectAuthEvents();
    StoreSdk.state.authenticated = true; // set initial

    const { data, error } = await service.revokeToken();

    expect(error).toBeFalsy();
    expect(data).toBeTruthy();
    expect(clearToken).toHaveBeenCalled();
    expect(StoreSdk.state.authenticated).toBe(false);
    const names = evs.map((e) => e.event);
    expect(names).toContain('auth:token:revoke:start');
    expect(names).toContain('auth:token:revoke:success');
    expect(names).toContain('auth:changed');
    expect(mockedPost.mock.calls[0][0]).toBe(
      '/wp-json/store-sdk/v1/auth/revoke'
    );
  });

  it('revoke token error does not clear token or update state', async () => {
    const clearToken = vi.fn(async () => Promise.resolve());
    config.auth = { clearToken };
    const apiError: ApiError = {
      code: 'revoke_fail',
      message: 'x',
      data: { status: 500 },
      details: {},
    };
    mockedPost.mockResolvedValue({ error: apiError });
    const evs = collectAuthEvents();
    StoreSdk.state.authenticated = true;

    const { data, error } = await service.revokeToken();

    expect(data).toBeFalsy();
    expect(error).toEqual(apiError);
    expect(clearToken).not.toHaveBeenCalled();
    expect(StoreSdk.state.authenticated).toBe(true);
    const names = evs.map((e) => e.event);
    expect(names).toContain('auth:token:revoke:error');
  });

  it('one-time token success', async () => {
    const oneTime: AuthOneTimeTokenResponse = {
      one_time_token: 'one',
      expires_in: 15,
    };
    mockedPost.mockResolvedValue({ data: oneTime });
    const req: AuthOneTimeTokenRequest = { ttl: 30 };
    const { data, error } = await service.oneTimeToken(req);
    expect(error).toBeFalsy();
    expect(data?.one_time_token).toBe('one');
    expect(mockedPost.mock.calls[0][0]).toBe(
      '/wp-json/store-sdk/v1/auth/one-time-token'
    );
  });

  it('validate token', async () => {
    const validateResp: AuthValidateResponse = {
      valid: true,
      payload: {
        iss: 'issuer',
        iat: Date.now() / 1000,
        nbf: Date.now() / 1000,
        exp: Date.now() / 1000 + 3600,
        sub: 1,
        login: 'u',
        email: 'e',
        ver: 1,
      },
    };
    mockedGet.mockResolvedValue({ data: validateResp });
    const { data } = await service.validate();
    expect(data?.valid).toBe(true);
    expect(mockedGet.mock.calls[0][0]).toBe(
      '/wp-json/store-sdk/v1/auth/validate'
    );
  });

  it('status', async () => {
    const status: AuthStatusResponse = {
      active: true,
      flag_defined: true,
      flag_enabled: true,
      secret_defined: true,
      secret_length: 32,
      endpoints: { token: true },
      version: '1.0.0',
      timestamp: Date.now(),
    };
    mockedGet.mockResolvedValue({ data: status });
    const { data } = await service.status();
    expect(data?.active).toBe(true);
    expect(mockedGet.mock.calls[0][0]).toBe(
      '/wp-json/store-sdk/v1/auth/status'
    );
  });

  describe('getAutoLoginUrl', () => {
    it('generates correct auto-login URL with token and redirect URL', async () => {
      const mockToken = 'test-jwt-token-123';
      const redirect = 'https://example.com/dashboard';

      const result = await service.getAutoLoginUrl(mockToken, redirect);

      expect(result).toBe(
        'https://example.com/wp-json/store-sdk/v1/auth/autologin?token=test-jwt-token-123&redirect=https%3A%2F%2Fexample.com%2Fdashboard'
      );
    });

    it('properly encodes special characters in redirect URL', async () => {
      const mockToken = 'test-token';
      const redirect = 'https://example.com/path?param=value&another=test';

      const result = await service.getAutoLoginUrl(mockToken, redirect);

      expect(result).toBe(
        'https://example.com/wp-json/store-sdk/v1/auth/autologin?token=test-token&redirect=https%3A%2F%2Fexample.com%2Fpath%3Fparam%3Dvalue%26another%3Dtest'
      );
    });

    it('generates auto-login URL with empty token', async () => {
      const emptyToken = '';
      const redirect = 'https://example.com/dashboard';

      const result = await service.getAutoLoginUrl(emptyToken, redirect);

      expect(result).toBe(
        'https://example.com/wp-json/store-sdk/v1/auth/autologin?token=&redirect=https%3A%2F%2Fexample.com%2Fdashboard'
      );
    });

    it('generates auto-login URL with complex JWT token', async () => {
      const mockToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const redirect = 'https://example.com/dashboard';

      const result = await service.getAutoLoginUrl(mockToken, redirect);

      expect(result).toBe(
        `https://example.com/wp-json/store-sdk/v1/auth/autologin?token=${encodeURIComponent(
          mockToken
        )}&redirect=https%3A%2F%2Fexample.com%2Fdashboard`
      );
    });
  });
});
