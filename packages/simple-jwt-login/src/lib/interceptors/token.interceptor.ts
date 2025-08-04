import { httpClient } from '@store-sdk/core';
import { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { AuthConfig } from '../types/auth.config.js';

export const addTokenInterceptor = (config: AuthConfig) => {
  httpClient.default.interceptors.request.use(
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
