import { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { httpClient } from '../../index.js';
import { StoreSdkEventEmitter } from '../sdk.event.emitter.js';

const CART_PATH = '/wp-json/wc/store/v1/cart';

export const addCartLoadingInterceptors = (events: StoreSdkEventEmitter) => {
  httpClient.default.interceptors.request.use(
    async (axiosConfig: InternalAxiosRequestConfig) => {
      if (!axiosConfig.url?.includes(CART_PATH)) return axiosConfig;

      events.emit('cartLoading', true);
      return axiosConfig;
    },
    (error: AxiosError | Error) => {
      return Promise.reject(error);
    }
  );

  httpClient.default.interceptors.response.use(async (response) => {
    if (!response.config.url?.includes(CART_PATH)) return response;

    events.emit('cartLoading', false);
    return response;
  });
};
