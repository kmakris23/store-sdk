import { StoreSdkPlugin } from '../plugins/plugin.js';

export interface StoreSdkConfig {
  baseUrl: string;
  auth?: {
    autoLoginUrl?: string;
    /**
     * Fetch the cart after login.
     * This is useful if you want to ensure the cart is up-to-date after a user logs in.
     * It will trigger a cart request after the login process.
     * Defaults to `false`.
     */
    fetchCartOnLogin?: boolean;
    /**
     * Revoke the token before login.
     * This is useful if you want to ensure the token is cleared before a new login attempt.
     * Defaults to `false`.
     */
    revokeTokenBeforeLogin?: boolean;
    useTokenInterceptor?: boolean;
    useRefreshTokenInterceptor?: boolean;
    getToken?: () => Promise<string>;
    setToken?: (token: string) => Promise<void>;
    getRefreshToken?: () => Promise<string>;
    setRefreshToken?: (refreshToken: string) => Promise<void>;
    clearToken?: () => Promise<void>;
  };
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
