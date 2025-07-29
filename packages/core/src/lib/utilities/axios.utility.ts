import { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { ApiError, AxiosApiResult } from '../types/api.js';

export const doRequest = async <T>(
  instance: AxiosInstance,
  url: string,
  options: AxiosRequestConfig = {}
): Promise<AxiosApiResult<T>> => {
  const { method = 'get', data, params, headers } = options;

  try {
    const response = await instance.request<T>({
      url,
      method,
      data,
      params,
      headers,
    });

    return {
      data: response.data,
      headers: response.headers,
    } as AxiosApiResult<T>;
  } catch (error) {
    const axiosError = error as AxiosError<ApiError>;
    return {
      error: axiosError.response?.data ?? null,
      headers: axiosError.response?.headers,
    } as AxiosApiResult<T>;
  }
};
