import { AuthConfig } from './auth.config.js';
import { TokenRequest } from './types/token/token.request.js';
import { TokenResponse } from './types/token/token.response.js';
import { ApiResult, doPost } from '@store-sdk/core';

export class AuthService {
  private readonly config: AuthConfig;

  constructor(config: AuthConfig) {
    this.config = config;
  }

  /**
   * Authenticate user
   * @param request
   * @returns {AuthResponse}
   */
  async token(body: TokenRequest): Promise<ApiResult<TokenResponse>> {
    const endpoint = '/wp-json/jwt-auth/v1/token';

    const { data, error } = await doPost<TokenResponse, TokenRequest>(
      endpoint,
      body
    );

    if (this.config.setToken) {
      this.config.setToken(data?.token ?? '');
    }

    return { data, error };
  }

  /**
   * Validate token
   * @param request
   * @returns {unknown}
   */
  async tokenValidate(): Promise<ApiResult<unknown>> {
    const endpoint = '/wp-json/jwt-auth/v1/token/validate';

    const { data, error } = await doPost<unknown, unknown>(endpoint);

    return { data, error };
  }
}
