import { httpClient, SimpleJwtLoginConfig } from '@store-sdk/core';
import { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const addTokenInterceptor = (config: SimpleJwtLoginConfig) => {
  httpClient.interceptors.request.use(
    async (axiosConfig: InternalAxiosRequestConfig) => {
      if (config.getToken) {
        const bearerToken = await config.getToken();
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
