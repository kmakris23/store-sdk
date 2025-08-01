import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

let httpClient: AxiosInstance | null = null;

export function createHttpClient(config: AxiosRequestConfig): AxiosInstance {
  if (!httpClient) {
    httpClient = axios.create(config);
  }
  return httpClient;
}

// Proxy makes sure it's safe and throws if used before init
const exportedHttpClient = new Proxy({} as AxiosInstance, {
  get(_target, prop) {
    if (!httpClient) {
      throw new Error(
        'httpClient not initialized. Call createHttpClient(config) first.'
      );
    }
    return (httpClient as any)[prop];
  },
});

export default exportedHttpClient;
