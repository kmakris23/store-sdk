import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Sdk } from '../../../sdk.js';
import { StoreSdkConfig } from '../../../configs/sdk.config.js';
import { SimpleJwtLoginConfig } from '../../../configs/simple.jwt.login.config.js';
import { EventBus } from '../../../bus/event.bus.js';
import { StoreSdkEvent } from '../../../sdk.events.js';
import { StoreSdkState } from '../../../types/sdk.state.js';

// We need to create a minimal mock of the simple-jwt-login plugin for testing
// This simulates how the actual plugin would work with our new architecture
class MockSimpleJwtPlugin {
  id = 'simple-jwt-login' as const;
  private _config: SimpleJwtLoginConfig;
  private _eventHandlersRegistered = false;

  constructor(config: SimpleJwtLoginConfig) {
    this._config = config;
  }

  getConfig() {
    return this._config;
  }

  init() {
    // Simulate plugin initialization
  }

  registerEventHandlers(
    events: EventBus<StoreSdkEvent>,
    state: StoreSdkState,
    config: StoreSdkConfig,
    sdk: Sdk
  ): void {
    this._eventHandlersRegistered = true;

    // This is the actual logic that was moved from core to the plugin
    events.on('auth:changed', async (authenticated: boolean) => {
      if (this._config.fetchCartOnLogin) {
        if (authenticated) {
          await sdk.store.cart.get();
        }
      }

      if (!authenticated) {
        if (config.nonce?.clearToken) {
          await config.nonce?.clearToken();
        }
        if (config.cartToken?.clearToken) {
          await config.cartToken?.clearToken();
        }
      }
    });
  }

  extend(sdk: Sdk) {
    // Simulate extending the SDK with auth capabilities
    (sdk as unknown as { simpleJwt?: { auth: unknown; users: unknown } }).simpleJwt = {
      auth: { isAuthenticated: () => true },
      users: { getCurrentUser: () => ({ id: 1 }) },
    };
  }

  get eventHandlersRegistered() {
    return this._eventHandlersRegistered;
  }
}

// Mock dependencies
vi.mock('../../../services/api.js', () => ({
  createHttpClient: vi.fn(),
  httpClient: {},
}));

vi.mock('../../../interceptors/cart.token.interceptor.js', () => ({
  addCartTokenInterceptors: vi.fn(),
}));

vi.mock('../../../interceptors/nonce.interceptor.js', () => ({
  addNonceInterceptors: vi.fn(),
}));

const mockCartGet = vi.fn();
vi.mock('../../../services/store.service.js', () => ({
  StoreService: vi.fn().mockImplementation(() => ({
    cart: {
      get: mockCartGet,
    },
  })),
}));

describe('Simple JWT Login Plugin Integration', () => {
  let sdk: Sdk;
  let mockPlugin: MockSimpleJwtPlugin;
  let config: StoreSdkConfig;
  let mockClearNonce: ReturnType<typeof vi.fn>;
  let mockClearCartToken: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    sdk = new Sdk();
    mockClearNonce = vi.fn();
    mockClearCartToken = vi.fn();

    const simpleJwtConfig: SimpleJwtLoginConfig = {
      fetchCartOnLogin: true,
      getToken: vi.fn().mockResolvedValue('test-token'),
      setToken: vi.fn(),
      clearToken: vi.fn(),
    };

    mockPlugin = new MockSimpleJwtPlugin(simpleJwtConfig);

    config = {
      baseUrl: 'https://example.com',
  plugins: [mockPlugin as unknown as never],
      nonce: {
        clearToken: mockClearNonce,
      },
      cartToken: {
        clearToken: mockClearCartToken,
      },
    };
  });

  it('should register simple-jwt-login event handlers via new architecture', async () => {
    await sdk.init(config);

    expect(mockPlugin.eventHandlersRegistered).toBe(true);
  });

  it('should fetch cart on login when fetchCartOnLogin is true', async () => {
    await sdk.init(config);

    // Simulate authentication event
    sdk.events.emit('auth:changed', true);

    // Wait for async operations
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockCartGet).toHaveBeenCalled();
  });

  it('should not fetch cart on login when fetchCartOnLogin is false', async () => {
    const simpleJwtConfig: SimpleJwtLoginConfig = {
      fetchCartOnLogin: false,
      getToken: vi.fn().mockResolvedValue('test-token'),
    };

    const mockPluginNoFetch = new MockSimpleJwtPlugin(simpleJwtConfig);

    const configNoFetch = {
      ...config,
  plugins: [mockPluginNoFetch as unknown as never],
    };

    // Create a fresh SDK instance to avoid interference
    const freshSdk = new Sdk();
    await freshSdk.init(configNoFetch);

    // Reset mock after initialization
    mockCartGet.mockClear();

    // Simulate authentication event
    freshSdk.events.emit('auth:changed', true);

    // Wait for async operations
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockCartGet).not.toHaveBeenCalled();
  });

  it('should clear tokens on logout', async () => {
    await sdk.init(config);

    // Simulate logout event
    sdk.events.emit('auth:changed', false);

    // Wait for async operations
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockClearNonce).toHaveBeenCalled();
    expect(mockClearCartToken).toHaveBeenCalled();
  });

  it('should extend SDK with simple-jwt capabilities', async () => {
    await sdk.init(config);

  const simpleJwt = (sdk as unknown as { simpleJwt: { auth: unknown; users: unknown } }).simpleJwt;
  expect(simpleJwt).toBeDefined();
  expect(simpleJwt.auth).toBeDefined();
  expect(simpleJwt.users).toBeDefined();
  });

  it('should work without nonce or cartToken configured', async () => {
    const configMinimal = {
      baseUrl: 'https://example.com',
  plugins: [mockPlugin as unknown as never],
    };

    // Should not throw
    await expect(sdk.init(configMinimal)).resolves.not.toThrow();

    // Logout should not throw even without token clearers
    expect(() => sdk.events.emit('auth:changed', false)).not.toThrow();
  });
});
