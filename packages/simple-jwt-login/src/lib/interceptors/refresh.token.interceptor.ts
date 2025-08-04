import { httpClient } from '@store-sdk/core';
import { AuthConfig } from '../types/auth.config.js';
import axios from 'axios';
import { AuthService } from '../services/auth.service.js';

export const addRefreshTokenInterceptor = (
  config: AuthConfig,
  auth: AuthService
) => {
  httpClient.default.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true; // Mark the request as retried to avoid infinite loops.
        try {
          if (!config.getToken || !config.setToken) {
            return Promise.reject();
          }

          const token = await config.getToken();
          if (!token) return Promise.reject();

          const { data, error } = await auth.refreshToken({
            JWT: token,
          });
          if (error) return Promise.reject(error);
          if (!data) return Promise.reject();

          await config.setToken(data?.jwt);

          return axios({
            ...originalRequest,
            headers: {
              ...originalRequest.headers,
              Authorization: `Bearer ${data?.jwt}`,
            },
          });
        } catch (refreshError) {
          if (config.clearToken) {
            await config.clearToken();
          }
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );
};
