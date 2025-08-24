import { httpClient, SimpleJwtLoginConfig, StoreSdk } from '@store-sdk/core';
import axios, { AxiosRequestConfig } from 'axios';
import { AuthService } from '../services/auth.service.js';

export const addRefreshTokenInterceptor = (
  config: SimpleJwtLoginConfig,
  auth: AuthService
) => {
  httpClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (
        error.response &&
        error.response.status === 401 &&
        originalRequest &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true; // Mark the request as retried to avoid infinite loops.
        try {
          if (!config.getToken || !config.setToken) {
            return await refreshTokenFailed(config);
          }

          const token = await config.getToken();
          if (!token) return await refreshTokenFailed(config);

          const { data, error } = await auth.refreshToken(
            {
              JWT: token,
            },
            { _retry: true } as AxiosRequestConfig
          );
          if (error) return await refreshTokenFailed(config, error);
          if (!data) return await refreshTokenFailed(config);

          await config.setToken(data?.jwt);

          return axios({
            ...originalRequest,
            headers: {
              ...originalRequest.headers,
              Authorization: `Bearer ${data?.jwt}`,
            },
          });
        } catch (refreshError) {
          return await refreshTokenFailed(config, refreshError);
        }
      }
      return await refreshTokenFailed(config, error);
    }
  );
};

const refreshTokenFailed = async (
  config: SimpleJwtLoginConfig,
  reason?: unknown
) => {
  if (config.clearToken) {
    await config.clearToken();
  }
  StoreSdk.state.authenticated = false;
  StoreSdk.events.emit('auth:changed', false);
  return Promise.reject(reason);
};
