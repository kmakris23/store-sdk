import {
  PluginId,
  Sdk,
  SimpleJwtLoginConfig,
  StoreSdk,
  StoreSdkPlugin,
} from '@store-sdk/core';
import { AuthService } from './services/auth.service.js';
import { UserService } from './services/user.service.js';
import { addTokenInterceptor } from './interceptors/token.interceptor.js';
import { addRefreshTokenInterceptor } from './interceptors/refresh.token.interceptor.js';
import qs from 'qs';
import { DEFAULT_ROUTE_NAMESPACE } from './constants.js';

declare module '@store-sdk/core' {
  interface Sdk {
    simpleJwt: {
      auth: AuthService;
      users: UserService;
      getAutoLoginUrl: () => Promise<string>;
    };
  }
}

class SimpleJwtPlugin implements StoreSdkPlugin<SimpleJwtLoginConfig> {
  private _auth!: AuthService;
  private _users!: UserService;
  private readonly _config: SimpleJwtLoginConfig;

  id: PluginId = 'simple-jwt-login';

  constructor(config: SimpleJwtLoginConfig) {
    this._config = config;
  }

  getConfig(): SimpleJwtLoginConfig {
    return this._config;
  }
  init(): void {
    this._auth = new AuthService(this._config);
    this._users = new UserService(this._config);

    const useTokenInterceptor = this._config.useTokenInterceptor ?? true;
    if (useTokenInterceptor) {
      addTokenInterceptor(this._config);
    }

    const useRefreshTokenInterceptor =
      this._config.useRefreshTokenInterceptor ?? true;
    if (useRefreshTokenInterceptor) {
      addRefreshTokenInterceptor(this._config, this._auth);
    }

    // Set initial authentication state based on config
    // This is useful if the token is already set
    if (this._config.getToken) {
      this._config.getToken().then((token) => {
        StoreSdk.state.authenticated = !!token;
        StoreSdk.events.emit('auth:changed', !!token);
      });
    }
  }

  extend(sdk: Sdk) {
    (sdk as any)._auth = this._auth;
    (sdk as any)._users = this._users;

    const simpleJwt = {
      auth: this._auth,
      users: this._users,
      getAutoLoginUrl: async (redirectUrl?: string) => {
        const jwt = await this._config.getToken?.();

        const params = qs.stringify({
          JWT: jwt,
          redirectUrl: redirectUrl ?? this._config.autoLoginRedirectUrl,
        });

        const namespace =
          this._config.routeNamespace ?? DEFAULT_ROUTE_NAMESPACE;
        const endpoint = `wp-json/${namespace}/autologin`;
        return `${this._config.autoLoginUrl}/${endpoint}?${params}`;
      },
    };

    Object.defineProperty(sdk, 'simpleJwt', {
      get: () => simpleJwt,
      configurable: false,
      enumerable: true,
    });
  }
}

export const useSimpleJwt = (config: SimpleJwtLoginConfig) => {
  return new SimpleJwtPlugin(config);
};
