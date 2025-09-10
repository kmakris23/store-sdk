import { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { httpClient } from '../services/api.js';
import { StoreSdkConfig } from '../configs/sdk.config.js';

export const addTokenInterceptor = (config: StoreSdkConfig) => {
  httpClient.interceptors.request.use(
    async (axiosConfig: InternalAxiosRequestConfig) => {
      if (config.auth?.getToken) {
        const bearerToken = await config.auth.getToken();
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
};
