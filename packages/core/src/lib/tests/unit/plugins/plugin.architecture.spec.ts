import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Sdk } from '../../../sdk.js';
import { StoreSdkPlugin, PluginId } from '../../../plugins/plugin.js';
import { EventBus } from '../../../bus/event.bus.js';
import { StoreSdkEvent } from '../../../sdk.events.js';
import { StoreSdkState } from '../../../types/sdk.state.js';
import { StoreSdkConfig } from '../../../configs/sdk.config.js';

// Mock a test plugin
class TestPlugin implements StoreSdkPlugin<{ testConfig: string }> {
  id: PluginId = 'hippoo';
  private config = { testConfig: 'test' };

  public initCalled = false;
  public registerEventHandlersCalled = false;
  public extendCalled = false;
  public receivedEvents?: EventBus<StoreSdkEvent>;
  public receivedState?: StoreSdkState;
  public receivedConfig?: StoreSdkConfig;
  public receivedSdk?: Sdk;

  getConfig() {
    return this.config;
  }

  init(): void {
    this.initCalled = true;
  }

  registerEventHandlers(
    events: EventBus<StoreSdkEvent>,
    state: StoreSdkState,
    config: StoreSdkConfig,
    sdk: Sdk
  ): void {
    this.registerEventHandlersCalled = true;
    this.receivedEvents = events;
    this.receivedState = state;
    this.receivedConfig = config;
    this.receivedSdk = sdk;

    // Register a test event handler
    events.on('auth:changed', (authenticated) => {
      state.testValue = authenticated ? 'logged-in' : 'logged-out';
    });
  }

  extend(sdk: Sdk): void {
    this.extendCalled = true;
    (sdk as unknown as { testExtension?: string }).testExtension = 'extended';
  }
}

// Extend the state type for testing
declare module '../../../types/sdk.state.js' {
  interface StoreSdkState {
    testValue?: string;
  }
}

// Mock the HTTP client and other dependencies
vi.mock('../../../services/api.js', () => ({
  createHttpClient: vi.fn(),
  httpClient: {
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

vi.mock('../../../interceptors/cart.token.interceptor.js', () => ({
  addCartTokenInterceptors: vi.fn(),
}));

vi.mock('../../../interceptors/nonce.interceptor.js', () => ({
  addNonceInterceptors: vi.fn(),
}));

vi.mock('../../../services/store.service.js', () => ({
  StoreService: vi.fn().mockImplementation(() => ({
    cart: {
      get: vi.fn(),
    },
  })),
}));

describe('Plugin Architecture', () => {
  let sdk: Sdk;
  let testPlugin: TestPlugin;
  let config: StoreSdkConfig;

  beforeEach(() => {
    sdk = new Sdk();
    testPlugin = new TestPlugin();
    config = {
      baseUrl: 'https://example.com',
      plugins: [testPlugin],
    };
  });

  it('should call plugin methods in correct order', async () => {
    await sdk.init(config);

    expect(testPlugin.initCalled).toBe(true);
    expect(testPlugin.registerEventHandlersCalled).toBe(true);
    expect(testPlugin.extendCalled).toBe(true);
  });

  it('should pass correct parameters to registerEventHandlers', async () => {
    await sdk.init(config);

    expect(testPlugin.receivedEvents).toBe(sdk.events);
    expect(testPlugin.receivedState).toBe(sdk.state);
    expect(testPlugin.receivedConfig).toBe(config);
    expect(testPlugin.receivedSdk).toBe(sdk);
  });

  it('should allow plugins to register event handlers', async () => {
    await sdk.init(config);

    // Test that the plugin's event handler is working
    sdk.events.emit('auth:changed', true);
    expect(sdk.state.testValue).toBe('logged-in');

    sdk.events.emit('auth:changed', false);
    expect(sdk.state.testValue).toBe('logged-out');
  });

  it('should allow plugins to extend the SDK', async () => {
    await sdk.init(config);

    expect((sdk as unknown as { testExtension?: string }).testExtension).toBe(
      'extended'
    );
  });

  it('should handle plugins without registerEventHandlers method', async () => {
    // Create a plugin without the registerEventHandlers method
    const simplePlugin: StoreSdkPlugin<Record<string, never>> = {
      id: 'hippoo',
      getConfig: () => ({}),
      init: vi.fn(),
      extend: vi.fn(),
    };

    const simpleConfig = {
      baseUrl: 'https://example.com',
      plugins: [simplePlugin],
    };

    // Should not throw an error
    await expect(sdk.init(simpleConfig)).resolves.not.toThrow();
    expect(simplePlugin.init).toHaveBeenCalled();
    expect(simplePlugin.extend).toHaveBeenCalled();
  });

  it('should process multiple plugins correctly', async () => {
    const secondPlugin = new TestPlugin();
    config.plugins = [testPlugin, secondPlugin];

    await sdk.init(config);

    expect(testPlugin.initCalled).toBe(true);
    expect(testPlugin.registerEventHandlersCalled).toBe(true);
    expect(testPlugin.extendCalled).toBe(true);

    expect(secondPlugin.initCalled).toBe(true);
    expect(secondPlugin.registerEventHandlersCalled).toBe(true);
    expect(secondPlugin.extendCalled).toBe(true);
  });
});
