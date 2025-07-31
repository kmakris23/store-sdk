import { Sdk, StoreSdkConfig, StoreSdkPlugin } from '@store-sdk/core';
import { HippoService } from './hippoo.service.js';
import { HippoConfig } from './types/sdk.config.hippoo.js';

declare module '@store-sdk/core' {
  interface Sdk {
    hippoo: HippoService;
  }
  interface StoreSdkState {
    isAuthenticated?: boolean;
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-empty-object-type
  interface StoreSdkConfig extends HippoConfig {}
}
class HippoooSdk implements StoreSdkPlugin {
  private _hippoo!: HippoService;

  async init(config: StoreSdkConfig): Promise<void> {
    this._hippoo = new HippoService(config.baseUrl, config);
  }

  extend(sdk: Sdk) {
    (sdk as any)._hippoo = this._hippoo;

    Object.defineProperty(sdk, 'hippoo', {
      get: () => this._hippoo,
      configurable: false,
      enumerable: true,
    });
  }
}

export const StoreSdkHippooo = new HippoooSdk();
