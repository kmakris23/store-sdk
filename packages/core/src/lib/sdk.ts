import { StoreSdkConfig } from './configs/sdk.config.js';
import { StoreSdkState } from './types/sdk.state.js';
import { StoreSdkEventEmitter } from './sdk.event.emitter.js';
import { createHttpClient } from './services/api.js';
import { addCartTokenInterceptors } from './interceptors/cart.token.interceptor.js';
import { addNonceInterceptors } from './interceptors/nonce.interceptor.js';
import { addCartLoadingInterceptors } from './interceptors/cart.loading.interceptor.js';
import { addSimpleJwtLoginInterceptors } from './interceptors/simple.jwt.login.interceptors.js';
import { StoreService } from './services/store.service.js';

export class Sdk {
  state: StoreSdkState = {};

  private _store!: StoreService;

  private _initialized = false;

  events = new StoreSdkEventEmitter();

  public async init(config: StoreSdkConfig): Promise<void> {
    if (this._initialized) return;

    this._store = new StoreService(this.state, config, this.events);

    createHttpClient({
      baseURL: config.baseUrl,
    });

    addNonceInterceptors(config, this.state, this.events);
    addCartTokenInterceptors(config, this.state, this.events);
    addCartLoadingInterceptors(this.events);

    const allPlugins = [...(config.plugins ?? [])];
    for (const plugin of allPlugins) {
      if (plugin.id === 'simple-jwt-login') {
        addSimpleJwtLoginInterceptors(config, plugin.getConfig(), this._store);
      }

      plugin.init();
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
