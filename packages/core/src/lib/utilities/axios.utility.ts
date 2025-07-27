import { AxiosError, AxiosInstance } from 'axios';
import { ApiError, ApiResult } from '../types/api.js';

type HttpMethod = 'get' | 'post' | 'put' | 'delete';

interface RequestOptions {
  method?: HttpMethod;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
}

export const doRequest = async <T>(
  instance: AxiosInstance,
  url: string,
  options: RequestOptions = {}
): Promise<ApiResult<T>> => {
  const { method = 'get', data, params, headers } = options;

  try {
    const response = await instance.request<T>({
      url,
      method,
      data,
      params,
      headers,
    });

    return { data: response.data, error: null };
  } catch (error) {
    const axiosError = error as AxiosError<ApiError>;
    return { data: null, error: axiosError.response?.data ?? null };
  }
};
