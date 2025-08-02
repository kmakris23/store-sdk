import {
  httpClient,
  Sdk,
  StoreSdkConfig,
  StoreSdkPlugin,
} from '@store-sdk/core';
import { HippoService } from './hippoo.service.js';
import { HippoConfig } from './types/hippoo.config.js';
import { AxiosError, InternalAxiosRequestConfig } from 'axios';

declare module '@store-sdk/core' {
  interface Sdk {
    hippoo: HippoService;
  }
  interface StoreSdkState {
    isAuthenticated?: boolean;
  }
}

class HippooPlugin implements StoreSdkPlugin {
  private _hippoo!: HippoService;
  private readonly _config: HippoConfig;

  constructor(config: HippoConfig) {
    this._config = config;
  }

  async init(config: StoreSdkConfig): Promise<void> {
    this._hippoo = new HippoService(config.baseUrl, this._config);

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
    (sdk as any)._hippoo = this._hippoo;

    Object.defineProperty(sdk, 'hippoo', {
      get: () => this._hippoo,
      configurable: false,
      enumerable: true,
    });
  }
}

export const useHippo = (config: HippoConfig) => {
  return new HippooPlugin(config);
};
