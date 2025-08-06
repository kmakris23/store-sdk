import { Sdk, StoreSdk, StoreSdkPlugin } from '@store-sdk/core';
import { AuthConfig } from './types/auth.config.js';
import { AuthService } from './services/auth.service.js';
import { UserService } from './services/user.service.js';
import { addTokenInterceptor } from './interceptors/token.interceptor.js';
import { addRefreshTokenInterceptor } from './interceptors/refresh.token.interceptor.js';

declare module '@store-sdk/core' {
  interface Sdk {
    simpleJwt: {
      auth: AuthService;
      users: UserService;
    };
  }
}

class SimpleJwtPlugin implements StoreSdkPlugin {
  private _auth!: AuthService;
  private _users!: UserService;
  private readonly _config: AuthConfig;

  constructor(config: AuthConfig) {
    this._config = config;
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
        StoreSdk.events.emit('authenticatedChanged', !!token);
      });
    }
  }

  extend(sdk: Sdk) {
    (sdk as any)._auth = this._auth;
    (sdk as any)._users = this._users;

    const simpleJwt = {
      auth: this._auth,
      users: this._users,
    };

    Object.defineProperty(sdk, 'simpleJwt', {
      get: () => simpleJwt,
      configurable: false,
      enumerable: true,
    });
  }
}

export const useSimpleJwt = (config: AuthConfig) => {
  return new SimpleJwtPlugin(config);
};
