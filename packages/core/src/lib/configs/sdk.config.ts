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
  plugins?: StoreSdkPlugin<Record<string, unknown>>[];
}
