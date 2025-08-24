import { StoreSdkPlugin } from '../plugins/plugin.js';

export interface StoreSdkConfig {
  baseUrl: string;
  nonce?: {
    disabled?: boolean;
    getToken?: () => Promise<string>;
    setToken?: (nonce: string) => Promise<void>;
    clearToken?: () => Promise<void>;
  };
  cartToken?: {
    disabled?: boolean;
    getToken?: () => Promise<string>;
    setToken?: (cartToken: string) => Promise<void>;
    clearToken?: () => Promise<void>;
  };
  /**
   * Plugins extending the SDK. Use generic parameter on StoreSdkPlugin to strongly type plugin config.
   */
  plugins?: StoreSdkPlugin<unknown>[];
}
