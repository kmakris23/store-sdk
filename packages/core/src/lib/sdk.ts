import { StoreSdkConfig } from './configs/sdk.config.js';
import { StoreSdkState } from './types/sdk.state.js';
import { createHttpClient } from './services/api.js';
import { addCartTokenInterceptors } from './interceptors/cart.token.interceptor.js';
import { addNonceInterceptors } from './interceptors/nonce.interceptor.js';
import { StoreService } from './services/store.service.js';
import { StoreSdkEvent } from './sdk.events.js';
import { EventBus } from './bus/event.bus.js';

export class Sdk {
  state: StoreSdkState = {};

  private _store!: StoreService;

  private _initialized = false;

  events = new EventBus<StoreSdkEvent>();

  public async init(config: StoreSdkConfig): Promise<void> {
    if (this._initialized) return;

    this._store = new StoreService(this.state, config, this.events);

    createHttpClient({
      baseURL: config.baseUrl,
    });

    addNonceInterceptors(config, this.state, this.events);
    addCartTokenInterceptors(config, this.state, this.events);

    const allPlugins = [...(config.plugins ?? [])];
    for (const plugin of allPlugins) {
      plugin.init();
      
      // Allow plugins to register their own event handlers
      if (plugin.registerEventHandlers) {
        plugin.registerEventHandlers(this.events, this.state, config, this);
      }
      
      if (plugin.extend) {
        plugin.extend(this);
      }
    }

    this._initialized = true;

    await this._store.cart.get();
  }

  /**
   * Store API
   */
  get store() {
    this.throwIfNotInitized();
    return this._store;
  }

  private throwIfNotInitized() {
    if (this._initialized) return;
    throw new Error('SDK not initialized. Call `await StoreSdk.init()` first.');
  }
}

export const StoreSdk = new Sdk();
