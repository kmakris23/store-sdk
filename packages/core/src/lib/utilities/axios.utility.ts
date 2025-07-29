import { AxiosError, AxiosInstance } from 'axios';
import { ApiError, AxiosApiResult } from '../types/api.js';

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
