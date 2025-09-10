import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { StoreSdk } from '../sdk.js';
import { httpClient } from '../services/api.js';
import { AuthService } from '../services/auth/auth.service.js';
import { StoreSdkConfig } from '../configs/sdk.config.js';
import { ApiError } from '../types/api.js';

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
      // For non-401 errors, just reject with the original error
      return Promise.reject(error);
    }
  );
};

const refreshTokenFailed = async (config: StoreSdkConfig, reason?: unknown) => {
  if (config.auth?.clearToken) {
    await config.auth.clearToken();
  }
  StoreSdk.state.authenticated = false;
  StoreSdk.events.emit('auth:changed', false);

  // Always return a consistent ApiError structure
  let apiError: ApiError;

  if (reason && typeof reason === 'object' && 'response' in reason) {
    // If it's an axios error with response data, extract the ApiError
    const axiosError = reason as AxiosError<ApiError>;
    apiError = axiosError.response?.data || {
      code: 'refresh_token_failed',
      message: 'Token refresh failed',
      data: { status: axiosError.response?.status || 401 },
      details: {},
    };
  } else if (reason && typeof reason === 'object' && 'code' in reason) {
    // If it's already an ApiError, use it
    apiError = reason as ApiError;
  } else {
    // Default error structure
    apiError = {
      code: 'refresh_token_failed',
      message: typeof reason === 'string' ? reason : 'Token refresh failed',
      data: { status: 401 },
      details: {},
    };
  }

  return Promise.reject(apiError);
};
