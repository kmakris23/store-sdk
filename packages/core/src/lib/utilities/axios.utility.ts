import { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { ApiError, AxiosApiResult } from '../types/api.js';
import httpClient from '../services/api.js';

export const doGet = async <T>(url: string, options?: AxiosRequestConfig) => {
  return await doRequest<T>(httpClient, url, {
    ...options,
    method: 'get',
  });
};

export const doPost = async <T, TData>(
  url: string,
  data?: TData,
  options?: AxiosRequestConfig
) => {
  return await doRequest<T>(httpClient, url, {
    ...options,
    method: 'post',
    data: data,
  });
};

export const doPut = async <T, TData>(
  url: string,
  data?: TData,
  options?: AxiosRequestConfig
) => {
  return await doRequest<T>(httpClient, url, {
    ...options,
    method: 'put',
    data: data,
  });
};

export const doDelete = async <T>(
  url: string,
  options?: AxiosRequestConfig
) => {
  return await doRequest<T>(httpClient, url, {
    ...options,
    method: 'delete',
  });
};

export const doRequest = async <T>(
  instance: AxiosInstance,
  url: string,
  options: AxiosRequestConfig
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
