import axios, { AxiosRequestConfig } from 'axios';
import { StoreSdk } from '../sdk.js';
import { httpClient } from '../services/api.js';
import { AuthService } from '../services/auth/auth.service.js';
import { StoreSdkConfig } from '../configs/sdk.config.js';

export const addRefreshTokenInterceptor = (
  config: StoreSdkConfig,
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
          if (!config.auth?.getRefreshToken) {
            return await refreshTokenFailed(config);
          }

          const refreshToken = await config.auth.getRefreshToken();
          if (!refreshToken) return await refreshTokenFailed(config);

          const { data, error } = await auth.refreshToken(
            {
              refresh_token: refreshToken,
            },
            {
              _retry: true,
            } as AxiosRequestConfig
          );
          if (error) return await refreshTokenFailed(config, error);
          if (!data) return await refreshTokenFailed(config);

          return axios({
            ...originalRequest,
            headers: {
              ...originalRequest.headers,
              Authorization: `Bearer ${data?.token}`,
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

const refreshTokenFailed = async (config: StoreSdkConfig, reason?: unknown) => {
  if (config.auth?.clearToken) {
    await config.auth.clearToken();
  }
  StoreSdk.state.authenticated = false;
  StoreSdk.events.emit('auth:changed', false);
  return Promise.reject(reason);
};
