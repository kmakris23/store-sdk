import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

let client: AxiosInstance | null = null;

export function createHttpClient(config: AxiosRequestConfig): AxiosInstance {
  if (!client) {
    client = axios.create(config);
  }
  return client;
}

// Proxy makes sure it's safe and throws if used before init
const exportedHttpClient = new Proxy({} as AxiosInstance, {
  get(_target, prop) {
    if (!client) {
      throw new Error(
        'httpClient not initialized. Call createHttpClient(config) first.'
      );
    }
    return (client as any)[prop];
  },
});

export const httpClient = exportedHttpClient;
