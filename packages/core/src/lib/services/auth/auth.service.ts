import { AxiosRequestConfig } from 'axios';
import { ApiResult } from '../../types/api.js';
import {
  AuthTokenRequest,
  AuthTokenResponse,
} from '../../types/auth/token/index.js';
import { doGet, doPost } from '../../utilities/axios.utility.js';
import {
  AuthRevokeRequest,
  AuthRevokeResponse,
} from '../../types/auth/revoke/index.js';
import { AuthRefreshRequest } from '../../types/auth/refresh/index.js';
import { AuthValidateResponse } from '../../types/auth/validate/index.js';
import { AuthOneTimeTokenRequest } from '../../types/auth/one-time-token/auth.one.time.token.request.js';
import { AuthOneTimeTokenResponse } from '../../types/auth/one-time-token/auth.one.time.token.response.js';
import { AuthStatusResponse } from '../../types/auth/status/auth.status.response.js';
import { BaseService } from '../base.service.js';
import qs from 'qs';

export class AuthService extends BaseService {
  private readonly endpoint = 'wp-json/store-sdk/v1/auth';

  async getAutoLoginUrl(
    ott: string,
    redirect: string,
    trackingParams?: Record<string, string | number | boolean>
  ) {
    const params = qs.stringify({
      token: ott,
      redirect: redirect,
      ...(trackingParams ?? {}),
    });

    const url = `${this.config.baseUrl}/${this.endpoint}/autologin`;
    return `${url}?${params}`;
  }

  async token(
    body: AuthTokenRequest,
    options?: AxiosRequestConfig
  ): Promise<ApiResult<AuthTokenResponse>> {
    const url = `/${this.endpoint}/token`;
    if (this.config.auth?.revokeTokenBeforeLogin) {
      await this.revokeToken();
    }

    this.events.emit('auth:login:start');

    const { data, error } = await doPost<AuthTokenResponse, AuthTokenRequest>(
      url,
      body,
      options
    );

    this.events.emitIf(!!data, 'auth:login:success');
    this.events.emitIf(!!error, 'auth:login:error', error);

    if (!error && data) {
      if (this.config.auth?.setToken) {
        this.state.authenticated = true;
        this.events.emit('auth:changed', true);

        await this.config.auth.setToken(data.token);
      }
      if (this.config.auth?.setRefreshToken) {
        await this.config.auth.setRefreshToken(data.refresh_token);
      }
    }

    return { data: data, error };
  }

  async refreshToken(
    body: AuthRefreshRequest,
    options?: AxiosRequestConfig
  ): Promise<ApiResult<AuthTokenResponse>> {
    const url = `/${this.endpoint}/refresh`;

    this.events.emit('auth:token:refresh:start');

    const { data, error } = await doPost<AuthTokenResponse, AuthRefreshRequest>(
      url,
      body,
      options
    );

    this.events.emitIf(!!data, 'auth:token:refresh:success');
    this.events.emitIf(!!error, 'auth:token:refresh:error', error);

    if (!error && data) {
      if (this.config.auth?.setToken) {
        await this.config.auth.setToken(data.token);
      }

      if (this.config.auth?.setRefreshToken) {
        await this.config.auth.setRefreshToken(data.refresh_token);
      }
    }

    return { data: data, error };
  }

  async revokeToken(
    body?: AuthRevokeRequest,
    options?: AxiosRequestConfig
  ): Promise<ApiResult<AuthRevokeResponse>> {
    const url = `/${this.endpoint}/revoke`;

    this.events.emit('auth:token:revoke:start');

    const { data, error } = await doPost<AuthRevokeResponse, AuthRevokeRequest>(
      url,
      body,
      options
    );

    this.events.emitIf(!!data, 'auth:token:revoke:success');
    this.events.emitIf(!!error, 'auth:token:revoke:error', error);

    if (!error) {
      if (this.config.auth?.clearToken) {
        await this.config.auth?.clearToken();
      }

      this.state.authenticated = false;
      this.events.emit('auth:changed', false);
    }

    return { data: data, error };
  }

  async oneTimeToken(
    body: AuthOneTimeTokenRequest,
    options?: AxiosRequestConfig
  ): Promise<ApiResult<AuthOneTimeTokenResponse>> {
    const url = `/${this.endpoint}/one-time-token`;

    const { data, error } = await doPost<
      AuthOneTimeTokenResponse,
      AuthOneTimeTokenRequest
    >(url, body, options);

    return { data: data, error };
  }

  async validate(
    options?: AxiosRequestConfig
  ): Promise<ApiResult<AuthValidateResponse>> {
    const url = `/${this.endpoint}/validate`;

    const { data, error } = await doGet<AuthValidateResponse>(url, options);

    return { data: data, error };
  }

  async status(
    options?: AxiosRequestConfig
  ): Promise<ApiResult<AuthStatusResponse>> {
    const url = `/${this.endpoint}/status`;

    const { data, error } = await doGet<AuthStatusResponse>(url, options);

    return { data: data, error };
  }
}
