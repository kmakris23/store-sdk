import { StoreSdkConfig } from '../configs/sdk.config.js';
import { httpClient } from '../../index.js';

const TOKEN_REVOKE_PATH = '/auth/revoke';

export const addSimpleJwtLoginInterceptors = (config: StoreSdkConfig) => {
  httpClient.default.interceptors.response.use(async (response) => {
    if (!response.config.url?.includes(TOKEN_REVOKE_PATH)) return response;

    if (!config.nonce?.disabled) {
      if (config.nonce?.clearToken) {
        await config.nonce?.clearToken();
      }
    }

    if (!config.cartToken?.disabled) {
      if (config.cartToken?.clearToken) {
        await config.cartToken?.clearToken();
      }
    }
    return response;
  });
};
