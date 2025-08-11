import { StoreSdkConfig } from '../configs/sdk.config.js';
import { httpClient, SimpleJwtLoginConfig } from '../../index.js';

export const addSimpleJwtLoginInterceptors = (
  config: StoreSdkConfig,
  simpleJwtLoginConfig: SimpleJwtLoginConfig
) => {
  httpClient.default.interceptors.response.use(async (response) => {
    const namespace = simpleJwtLoginConfig.routeNamespace;
    const tokenRevokePath = `/wp-json/${namespace}/auth/revoke`;

    if (!response.config.url?.includes(tokenRevokePath)) return response;

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
