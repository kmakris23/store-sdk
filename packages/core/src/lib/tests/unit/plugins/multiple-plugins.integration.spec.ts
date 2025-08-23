import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Sdk } from '../../../sdk.js';
import { StoreSdkConfig } from '../../../configs/sdk.config.js';

// Mock plugins for testing multiple plugin scenarios
class PluginA {
  id = 'hippoo' as const;
  public initCalled = false;
  public eventHandlersCalled = false;
  public extendCalled = false;

  getConfig() { return {}; }

  init() {
    this.initCalled = true;
  }

  registerEventHandlers(events: any) {
    this.eventHandlersCalled = true;
    events.on('auth:changed', (authenticated: boolean) => {
      // Plugin A logic
    });
  }

  extend(sdk: any) {
    this.extendCalled = true;
    sdk.pluginA = { name: 'Plugin A' };
  }
}

class PluginB {
  id = 'simple-jwt-login' as const;
  public initCalled = false;
  public eventHandlersCalled = false;
  public extendCalled = false;

  getConfig() { return {}; }

  init() {
    this.initCalled = true;
  }

  registerEventHandlers(events: any) {
    this.eventHandlersCalled = true;
    events.on('auth:changed', (authenticated: boolean) => {
      // Plugin B logic
    });
  }

  extend(sdk: any) {
    this.extendCalled = true;
    sdk.pluginB = { name: 'Plugin B' };
  }
}

// Mock dependencies
vi.mock('../../../services/api.js', () => ({
  createHttpClient: vi.fn(),
  httpClient: {}
}));

vi.mock('../../../interceptors/cart.token.interceptor.js', () => ({
  addCartTokenInterceptors: vi.fn()
}));

vi.mock('../../../interceptors/nonce.interceptor.js', () => ({
  addNonceInterceptors: vi.fn()
}));

vi.mock('../../../services/store.service.js', () => ({
  StoreService: vi.fn().mockImplementation(() => ({
    cart: { get: vi.fn() }
  }))
}));

describe('Multiple Plugins Integration', () => {
  let sdk: Sdk;
  let pluginA: PluginA;
  let pluginB: PluginB;
  let config: StoreSdkConfig;

  beforeEach(() => {
    vi.clearAllMocks();
    sdk = new Sdk();
    pluginA = new PluginA();
    pluginB = new PluginB();
    
    config = {
      baseUrl: 'https://example.com',
      plugins: [pluginA as any, pluginB as any]
    };
  });

  it('should initialize multiple plugins in order', async () => {
    await sdk.init(config);

    // All plugins should be initialized
    expect(pluginA.initCalled).toBe(true);
    expect(pluginB.initCalled).toBe(true);

    // All plugins should have registered event handlers
    expect(pluginA.eventHandlersCalled).toBe(true);
    expect(pluginB.eventHandlersCalled).toBe(true);

    // All plugins should have extended the SDK
    expect(pluginA.extendCalled).toBe(true);
    expect(pluginB.extendCalled).toBe(true);
  });

  it('should allow multiple plugins to extend the SDK', async () => {
    await sdk.init(config);

    // Both plugins should have added their extensions
    expect((sdk as any).pluginA).toEqual({ name: 'Plugin A' });
    expect((sdk as any).pluginB).toEqual({ name: 'Plugin B' });
  });

  it('should handle empty plugins array', async () => {
    const emptyConfig = {
      baseUrl: 'https://example.com',
      plugins: []
    };

    await expect(sdk.init(emptyConfig)).resolves.not.toThrow();
  });

  it('should handle missing plugins property', async () => {
    const noPluginsConfig = {
      baseUrl: 'https://example.com'
      // no plugins property
    };

    await expect(sdk.init(noPluginsConfig)).resolves.not.toThrow();
  });

  it('should preserve existing SDK functionality with plugins', async () => {
    await sdk.init(config);

    // SDK should still have its core functionality
    expect(sdk.events).toBeDefined();
    expect(sdk.state).toBeDefined();
    expect(() => sdk.store).not.toThrow(); // store getter should work
  });
});