import { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { StoreSdkConfig } from '../configs/sdk.config.js';
import { httpClient } from '../../index.js';
import { StoreSdkState } from '../types/sdk.state.js';
import { StoreSdkEventEmitter } from '../sdk.event.emitter.js';

export const addCartTokenInterceptors = (
  config: StoreSdkConfig,
  state: StoreSdkState,
  events: StoreSdkEventEmitter
) => {
  // Add interceptor for cart token
  httpClient.default.interceptors.request.use(
    async (axiosConfig: InternalAxiosRequestConfig) => {
      if (config.cartToken?.disabled) return axiosConfig;

      const cartToken = config.cartToken?.getToken
        ? await config.cartToken?.getToken()
        : state.cartToken;

      if (!cartToken) return axiosConfig;

      axiosConfig.headers['cart-token'] = cartToken;
      return axiosConfig;
    },
    (error: AxiosError | Error) => {
      return Promise.reject(error);
    }
  );

  httpClient.default.interceptors.response.use(async (response) => {
    if (config.cartToken?.disabled) return response;

    const headers = response.headers;
    const cartToken = headers['cart-token'];
    if (!cartToken) return response;

    state.cartToken = cartToken;
    if (config.cartToken?.setToken) {
      await config.cartToken?.setToken(cartToken);
    }
    events.emit('cartTokenChanged', cartToken);
    return response;
  });
};
