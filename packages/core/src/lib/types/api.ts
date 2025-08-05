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

export interface ApiPaginationResult<T> extends ApiResult<T> {
  /**
   * The total number of items in the collection.
   */
  total?: number;
  /**
   * The total number of pages in the collection.
   */
  totalPages?: number;

  /**
   * Contains links to other pages; next, prev, and up where applicable.
   */
  link?: {
    up?: string;
    prev?: string;
    next?: string;
  };
}

export interface AxiosApiResult<T> extends ApiResult<T> {
  headers?: RawAxiosResponseHeaders | AxiosResponseHeaders;
}
