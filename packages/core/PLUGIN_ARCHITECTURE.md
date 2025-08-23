# Enhanced Plugin Architecture - Usage Examples

This document demonstrates how the new plugin architecture works, showing how plugins can extend the functionality of @store-sdk/core package.

## Basic Plugin Structure

```typescript
import {
  StoreSdkPlugin,
  PluginId,
  EventBus,
  StoreSdkEvent,
  StoreSdkState,
  StoreSdkConfig,
  Sdk,
} from '@store-sdk/core';

class MyPlugin implements StoreSdkPlugin<MyPluginConfig> {
  id: PluginId = 'my-plugin';
  private config: MyPluginConfig;

  constructor(config: MyPluginConfig) {
    this.config = config;
  }

  getConfig() {
    return this.config;
  }

  // Initialize plugin services, interceptors, etc.
  init(): void {
    // Plugin initialization logic
    console.log('MyPlugin initialized');
  }

  // Optional: Register event handlers for plugin-specific business logic
  registerEventHandlers(
    events: EventBus<StoreSdkEvent>,
    state: StoreSdkState,
    config: StoreSdkConfig,
    sdk: Sdk
  ): void {
    // Register plugin-specific event handlers
    events.on('auth:changed', (authenticated) => {
      if (authenticated) {
        console.log('User authenticated, plugin can react');
      }
    });
  }

  // Extend the SDK with new methods and properties
  extend(sdk: Sdk): void {
    (sdk as any).myPlugin = {
      doSomething: () => 'Plugin functionality',
    };
  }
}
```

## Plugin Registration (Done Once in Core)

```typescript
import { StoreSdk } from '@store-sdk/core';
import { useMyPlugin } from '@my-org/my-plugin';

// Register plugins during SDK initialization
await StoreSdk.init({
  baseUrl: 'https://api.example.com',
  plugins: [
    useMyPlugin({
      /* plugin config */
    }),
  ],
});

// Use extended functionality
console.log(StoreSdk.myPlugin.doSomething());
```

## Plugin Execution Flow

1. **`init()`** - Plugin initializes its services, interceptors, etc.
2. **`registerEventHandlers()`** - Plugin registers event handlers for business logic
3. **`extend(sdk)`** - Plugin adds new methods/properties to the SDK instance

## Benefits of the New Architecture

- **No Hardcoded Logic**: Core SDK has no plugin-specific code
- **Self-Contained Plugins**: Each plugin manages its own event handlers and logic
- **Extensible**: Easy to add new plugins without modifying core
- **Backward Compatible**: Existing plugins continue to work
- **Type Safe**: Full TypeScript support with proper interfaces

## Example: Simple JWT Login Plugin

The simple-jwt-login plugin now manages its own event handlers:

```typescript
registerEventHandlers(events, state, config, sdk): void {
  events.on('auth:changed', async (authenticated) => {
    if (this.config.fetchCartOnLogin && authenticated) {
      await sdk.store.cart.get();
    }

    if (!authenticated) {
      // Clear tokens on logout
      await config.nonce?.clearToken?.();
      await config.cartToken?.clearToken?.();
    }
  });
}
```

This logic was previously hardcoded in the SDK core and is now properly encapsulated within the plugin itself.
