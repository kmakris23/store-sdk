import { RawAxiosResponseHeaders, AxiosResponseHeaders } from 'axios';

export interface ApiError {
  code: string;
  message: string;
  data: {
    status: number;
    params?: Record<string, string>;
  };
  details: Record<string, Record<string, string>>;
}

export interface ApiData<T> {
  data: T;
}

export interface ApiResult<T> {
  data?: T;
  error?: ApiError;
}

export interface AxiosApiResult<T> extends ApiResult<T> {
  headers?: RawAxiosResponseHeaders | AxiosResponseHeaders;
}
