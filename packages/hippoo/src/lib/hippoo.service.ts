import { ApiResult, doPost } from '@store-sdk/core';
import { LoginResponse } from './types/login/login.response.js';
import { LoginRequest } from './types/login/login.request.js';
import { SignupRequest } from './types/signup/signup.request.js';
import { SignupResponse } from './types/signup/signup.response.js';
import { RefreshTokenRequest } from './types/refresh-token/refresh.token.request.js';
import { RefreshTokenResponse } from './types/refresh-token/refresh.token.response.js';
import { ResetPasswordRequest } from './types/reset-password/reset.password.request.js';
import { ResetPasswordConfirmRequest } from './types/reset-password/reset.password.confirm.request.js';
import { LoginSocialRequest } from './types/login/login.social.request.js';
import { HippoConfig } from './types/hippoo.config.js';

export class HippoService {
  private readonly config: HippoConfig;

  constructor(config: HippoConfig) {
    this.config = config;
  }

  /**
   * User Registration
   * @param request
   * @returns {SignupResponse}
   */
  async signup(request: SignupRequest): Promise<ApiResult<SignupResponse>> {
    const endpoint = '/wp-json/hippoo-auth/v1/signup';
    const url = `/${endpoint}`;

    const { data, error } = await doPost<SignupResponse, SignupRequest>(
      url,
      request
    );

    if (this.config.setToken) {
      this.config.setToken(data?.token ?? '');
    }
    if (this.config.seRefreshtToken) {
      this.config.seRefreshtToken(data?.refresh_token ?? '');
    }

    return { data, error };
  }

  /**
   * User Login
   * @param request
   * @returns {LoginResponse}
   */
  async login(request: LoginRequest): Promise<ApiResult<LoginResponse>> {
    const endpoint = '/wp-json/hippoo-auth/v1/login';
    const url = `/${endpoint}`;
    const { data, error } = await doPost<LoginResponse, LoginRequest>(
      url,
      request
    );

    if (this.config.setToken) {
      this.config.setToken(data?.token ?? '');
    }
    if (this.config.seRefreshtToken) {
      this.config.seRefreshtToken(data?.refresh_token ?? '');
    }

    return { data, error };
  }

  /**
   * Refresh Token
   * @param request
   * @returns {RefreshTokenResponse}
   */
  async refreshToken(
    request: RefreshTokenRequest
  ): Promise<ApiResult<RefreshTokenResponse>> {
    const endpoint = '/wp-json/hippoo-auth/v1/refresh-token';
    const url = `/${endpoint}`;
    const { data, error } = await doPost<
      RefreshTokenResponse,
      RefreshTokenRequest
    >(url, request);

    if (this.config.setToken) {
      this.config.setToken(data?.token ?? '');
    }
    if (this.config.seRefreshtToken) {
      this.config.seRefreshtToken(data?.refresh_token ?? '');
    }

    return { data, error };
  }

  /**
   * Logout
   * @returns {unknown}
   */
  async logout(): Promise<ApiResult<unknown>> {
    const endpoint = '/wp-json/hippoo-auth/v1/logout';
    const url = `/${endpoint}`;
    const { data, error } = await doPost(url);

    return { data, error };
  }

  /**
   * Reset Password
   * @param request
   * @returns {string}
   */
  async resetPassword(
    request: ResetPasswordRequest
  ): Promise<ApiResult<string>> {
    const endpoint = '/wp-json/hippoo-auth/v1/reset-password/request';
    const url = `/${endpoint}`;
    const { data, error } = await doPost<string, ResetPasswordRequest>(
      url,
      request
    );

    return { data, error };
  }

  /**
   * Reset Password
   * @param request
   * @returns {string}
   */
  async resetPasswordConfirm(
    request: ResetPasswordConfirmRequest
  ): Promise<ApiResult<string>> {
    const endpoint = '/wp-json/hippoo-auth/v1/reset-password/confirm';
    const url = `/${endpoint}`;
    const { data, error } = await doPost<string, ResetPasswordConfirmRequest>(
      url,
      request
    );

    return { data, error };
  }

  /**
   * Social Login
   *
   * Supports Google, Apple, Facebook.
   * If the email doesn’t exist, a new user will be registered
   * @param request
   * @returns {unknown}
   */
  async loginSocial(request: LoginSocialRequest): Promise<ApiResult<unknown>> {
    const endpoint = '/wp-json/hippoo-auth/v1/login';
    const url = `/${endpoint}`;
    const { data, error } = await doPost<unknown, LoginSocialRequest>(
      url,
      request
    );
    return { data, error };
  }
}
