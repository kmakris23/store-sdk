import axios, { AxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import { StoreSdk } from '../sdk.js';
import { httpClient } from '../services/api.js';
import { AuthService } from '../services/auth/auth.service.js';
import { StoreSdkConfig } from '../configs/sdk.config.js';
import { ApiError } from '../types/api.js';

// Interface for queued request item
interface QueuedRequest {
  resolve: (value: AxiosResponse | Promise<AxiosResponse>) => void;
  reject: (reason: ApiError) => void;
  originalRequest: AxiosRequestConfig;
}

// Global state to manage single-flight refresh token requests
let isRefreshing = false;
let failedQueue: QueuedRequest[] = [];

// Function to reset the state (useful for testing)
export const resetRefreshTokenState = () => {
  isRefreshing = false;
  failedQueue = [];
};

const processQueue = (error: ApiError | null, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject, originalRequest }) => {
    if (error) {
      reject(error);
    } else {
      // Update the Authorization header with the new token
      if (!originalRequest.headers) {
        originalRequest.headers = {};
      }
      originalRequest.headers = {
        ...originalRequest.headers,
        Authorization: `Bearer ${token}`,
      };
      resolve(axios(originalRequest));
    }
  });

  failedQueue = [];
};

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
        if (isRefreshing) {
          // If refresh is already in progress, queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject, originalRequest });
          });
        }

        originalRequest._retry = true; // Mark the request as retried to avoid infinite loops.
        isRefreshing = true;

        try {
          if (!config.auth?.getRefreshToken) {
            const refreshError = await refreshTokenFailed(config);
            processQueue(refreshError, null);
            return refreshError;
          }

          const refreshToken = await config.auth.getRefreshToken();
          if (!refreshToken) {
            const refreshError = await refreshTokenFailed(config);
            processQueue(refreshError, null);
            return refreshError;
          }

          const { data, error: refreshError } = await auth.refreshToken(
            {
              refresh_token: refreshToken,
            },
            {
              _retry: true,
            } as AxiosRequestConfig
          );

          if (refreshError) {
            const tokenFailedError = await refreshTokenFailed(
              config,
              refreshError
            );
            processQueue(tokenFailedError, null);
            return tokenFailedError;
          }

          if (!data) {
            const tokenFailedError = await refreshTokenFailed(config);
            processQueue(tokenFailedError, null);
            return tokenFailedError;
          }

          // Success: process the queue with the new token
          processQueue(null, data.token);

          return axios({
            ...originalRequest,
            headers: {
              ...originalRequest.headers,
              Authorization: `Bearer ${data.token}`,
            },
          });
        } catch (refreshError) {
          const tokenFailedError = await refreshTokenFailed(
            config,
            refreshError
          );
          processQueue(tokenFailedError, null);
          return tokenFailedError;
        } finally {
          isRefreshing = false;
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
