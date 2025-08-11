import { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { StoreSdkConfig } from '../types/sdk.config.js';
import { httpClient } from '../../index.js';
import { StoreSdkState } from '../types/sdk.state.js';
import { StoreSdkEventEmitter } from '../sdk.event.emitter.js';

export const addNonceInterceptors = (
  config: StoreSdkConfig,
  state: StoreSdkState,
  events: StoreSdkEventEmitter
) => {
  httpClient.default.interceptors.request.use(
    async (axiosConfig: InternalAxiosRequestConfig) => {
      if (config.nonce?.disabled) return axiosConfig;

      const nonce = config.nonce?.getToken
        ? await config.nonce?.getToken()
        : state.nonce;

      if (!nonce) return axiosConfig;

      axiosConfig.headers['nonce'] = nonce;
      return axiosConfig;
    },
    (error: AxiosError | Error) => {
      return Promise.reject(error);
    }
  );

  httpClient.default.interceptors.response.use(async (response) => {
    if (config.nonce?.disabled) return response;

    const headers = response.headers;
    const nonce = headers['nonce'];
    if (!nonce) return response;

    state.nonce = nonce;
    if (config.nonce?.setToken) {
      await config.nonce?.setToken(nonce);
    }
    events.emit('nonceChanged', nonce);
    return response;
  });
};
