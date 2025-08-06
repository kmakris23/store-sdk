import { AuthConfig } from '../types/auth.config.js';
import { AuthRequest } from '../types/authentication/auth.request.js';
import { AuthResponse } from '../types/authentication/auth.response.js';
import { ApiResult, doGet, doPost, StoreSdk } from '@store-sdk/core';
import qs from 'qs';
import { AuthRefreshRequest } from '../types/authentication/auth.refresh.request.js';
import { DEFAULT_ROUTE_NAMESPACE } from '../constants.js';
import { AuthRevokeRequest } from '../types/authentication/auth.revoke.request.js';
import { AuthRevokeResponse } from '../types/authentication/auth.revoke.response.js';
import { AuthValidateRequest } from '../types/authentication/auth.validate.request.js';
import { AuthValidateResponse } from '../types/authentication/auth.validate.response.js';
import { SimpleJwtApiResult } from '../types/simple.jwt.api.result.js';

export class AuthService {
  private readonly config: AuthConfig;

  constructor(config: AuthConfig) {
    this.config = config;
  }

  async token(body: AuthRequest): Promise<ApiResult<AuthResponse>> {
    const namespace = this.config.routeNamespace ?? DEFAULT_ROUTE_NAMESPACE;
    const endpoint = `/wp-json/${namespace}/auth`;

    const { data, error } = await doPost<
      SimpleJwtApiResult<AuthResponse>,
      AuthRequest
    >(endpoint, body);

    if (this.config.setToken) {
      StoreSdk.state.authenticated = true;
      StoreSdk.events.emit('authenticatedChanged', true);

      this.config.setToken(data?.data.jwt ?? '');
    }

    return { data: data?.data, error };
  }

  async refreshToken(
    body: AuthRefreshRequest
  ): Promise<ApiResult<AuthResponse>> {
    const namespace = this.config.routeNamespace ?? DEFAULT_ROUTE_NAMESPACE;
    const endpoint = `/wp-json/${namespace}/auth/refresh`;

    const { data, error } = await doPost<
      SimpleJwtApiResult<AuthResponse>,
      AuthRefreshRequest
    >(endpoint, body);

    if (this.config.setToken) {
      this.config.setToken(data?.data.jwt ?? '');
    }

    return { data: data?.data, error };
  }

  async revokeToken(
    body: AuthRevokeRequest
  ): Promise<ApiResult<AuthRevokeResponse>> {
    const namespace = this.config.routeNamespace ?? DEFAULT_ROUTE_NAMESPACE;
    const endpoint = `/wp-json/${namespace}/auth/revoke`;

    if (!body.JWT && this.config.getToken) {
      body.JWT = await this.config.getToken();
    }

    const { data, error } = await doPost<
      SimpleJwtApiResult<AuthRevokeResponse>,
      AuthRevokeRequest
    >(endpoint, body);

    StoreSdk.state.authenticated = false;
    StoreSdk.events.emit('authenticatedChanged', false);

    return { data: data?.data, error };
  }

  async validateToken(
    params: AuthValidateRequest
  ): Promise<ApiResult<AuthValidateResponse>> {
    const namespace = this.config.routeNamespace ?? DEFAULT_ROUTE_NAMESPACE;
    const endpoint = `/wp-json/${namespace}/auth/validate`;
    const query = qs.stringify(params);
    const url = `/${endpoint}?${query}`;

    const { data, error } = await doGet<
      SimpleJwtApiResult<AuthValidateResponse>
    >(url);

    return { data: data?.data, error };
  }
}
