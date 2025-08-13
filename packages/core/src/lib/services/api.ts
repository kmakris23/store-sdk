import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

let _http: AxiosInstance | null = null;

export function createHttpClient(config: AxiosRequestConfig): AxiosInstance {
  if (_http) return _http; // idempotent
  _http = axios.create(config);
  return _http;
}

export function getHttpClient(): AxiosInstance {
  if (!_http) {
    throw new Error(
      'httpClient not initialized. Call createHttpClient(config) first.'
    );
  }
  return _http;
}

export const httpClient: AxiosInstance = new Proxy({} as AxiosInstance, {
  get(_t, prop) {
    return (getHttpClient() as any)[prop];
  },
});
