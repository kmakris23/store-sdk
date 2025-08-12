import { AuthRequest } from '../types/authentication/auth.request.js';
import { AuthResponse } from '../types/authentication/auth.response.js';
import {
  ApiResult,
  doGet,
  doPost,
  SimpleJwtLoginConfig,
  StoreSdk,
} from '@store-sdk/core';
import qs from 'qs';
import { AuthRefreshRequest } from '../types/authentication/auth.refresh.request.js';
import { DEFAULT_ROUTE_NAMESPACE } from '../constants.js';
import { AuthRevokeRequest } from '../types/authentication/auth.revoke.request.js';
import { AuthRevokeResponse } from '../types/authentication/auth.revoke.response.js';
import { AuthValidateRequest } from '../types/authentication/auth.validate.request.js';
import { AuthValidateResponse } from '../types/authentication/auth.validate.response.js';
import { SimpleJwtApiResult } from '../types/simple.jwt.api.result.js';
import { AxiosRequestConfig } from 'axios';

export class AuthService {
  private readonly config: SimpleJwtLoginConfig;

  constructor(config: SimpleJwtLoginConfig) {
    this.config = config;
  }

  async token(
    body: AuthRequest,
    options?: AxiosRequestConfig
  ): Promise<ApiResult<AuthResponse>> {
    const namespace = this.config.routeNamespace ?? DEFAULT_ROUTE_NAMESPACE;
    const endpoint = `/wp-json/${namespace}/auth`;

    StoreSdk.events.emit('auth:login:start');

    const { data, error } = await doPost<
      SimpleJwtApiResult<AuthResponse>,
      AuthRequest
    >(endpoint, body, options);

    StoreSdk.events.emitIf(!!data, 'auth:login:success');
    StoreSdk.events.emitIf(!!error, 'auth:login:error', error);

    if (this.config.setToken) {
      StoreSdk.state.authenticated = true;
      StoreSdk.events.emit('auth:changed', true);

      this.config.setToken(data?.data.jwt ?? '');
    }

    return { data: data?.data, error };
  }

  async refreshToken(
    body: AuthRefreshRequest,
    options?: AxiosRequestConfig
  ): Promise<ApiResult<AuthResponse>> {
    const namespace = this.config.routeNamespace ?? DEFAULT_ROUTE_NAMESPACE;
    const endpoint = `/wp-json/${namespace}/auth/refresh`;

    StoreSdk.events.emit('auth:token:refresh:start');

    const { data, error } = await doPost<
      SimpleJwtApiResult<AuthResponse>,
      AuthRefreshRequest
    >(endpoint, body, options);

    StoreSdk.events.emitIf(!!data, 'auth:token:refresh:success');
    StoreSdk.events.emitIf(!!error, 'auth:token:refresh:error', error);

    if (this.config.setToken) {
      this.config.setToken(data?.data.jwt ?? '');
    }

    return { data: data?.data, error };
  }

  async revokeToken(
    body?: AuthRevokeRequest,
    options?: AxiosRequestConfig
  ): Promise<ApiResult<AuthRevokeResponse>> {
    const namespace = this.config.routeNamespace ?? DEFAULT_ROUTE_NAMESPACE;
    const endpoint = `/wp-json/${namespace}/auth/revoke`;

    StoreSdk.events.emit('auth:token:revoke:start');

    const { data, error } = await doPost<
      SimpleJwtApiResult<AuthRevokeResponse>,
      AuthRevokeRequest
    >(endpoint, body, options);

    StoreSdk.events.emitIf(!!data, 'auth:token:revoke:success');
    StoreSdk.events.emitIf(!!error, 'auth:token:revoke:error', error);

    if (!error) {
      if (this.config.clearToken) {
        await this.config.clearToken();
      }

      StoreSdk.state.authenticated = false;
      StoreSdk.events.emit('auth:changed', false);
    }

    return { data: data?.data, error };
  }

  async validateToken(
    params: AuthValidateRequest,
    options?: AxiosRequestConfig
  ): Promise<ApiResult<AuthValidateResponse>> {
    const namespace = this.config.routeNamespace ?? DEFAULT_ROUTE_NAMESPACE;
    const endpoint = `/wp-json/${namespace}/auth/validate`;
    const query = qs.stringify(params);
    const url = `/${endpoint}?${query}`;

    const { data, error } = await doGet<
      SimpleJwtApiResult<AuthValidateResponse>
    >(url, options);

    return { data: data?.data, error };
  }
}
