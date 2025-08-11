import { httpClient, PluginId, Sdk, StoreSdkPlugin } from '@store-sdk/core';
import { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { AuthService } from './auth.service.js';
import { AuthConfig } from './auth.config.js';

declare module '@store-sdk/core' {
  interface Sdk {
    auth: AuthService;
  }
  interface StoreSdkState {
    isAuthenticated?: boolean;
  }
}

class AuthPlugin implements StoreSdkPlugin {
  private _auth!: AuthService;
  private readonly _config: AuthConfig;

  id: PluginId = 'jwt-authentication-for-wp-rest-api';

  constructor(config: AuthConfig) {
    this._config = config;
  }

  init(): void {
    this._auth = new AuthService(this._config);
    httpClient.default.interceptors.request.use(
      async (axiosConfig: InternalAxiosRequestConfig) => {
        if (this._config.getToken) {
          const bearerToken = await this._config.getToken();
          if (bearerToken) {
            axiosConfig.headers['Authorization'] = `Bearer ${bearerToken}`;
          }
        }

        return axiosConfig;
      },
      (error: AxiosError | Error) => {
        return Promise.reject(error);
      }
    );
  }

  extend(sdk: Sdk) {
    (sdk as any)._hippoo = this._auth;

    Object.defineProperty(sdk, 'auth', {
      get: () => this._auth,
      configurable: false,
      enumerable: true,
    });
  }
}

export const useAuth = (config: AuthConfig) => {
  return new AuthPlugin(config);
};
