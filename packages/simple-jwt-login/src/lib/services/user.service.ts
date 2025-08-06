import { ApiResult, doDelete, doPost, doPut } from '@store-sdk/core';
import { AuthConfig } from '../types/auth.config.js';
import { UserChangePasswordRequest } from '../types/user/user.change.password.request.js';
import { DEFAULT_ROUTE_NAMESPACE } from '../constants.js';
import { UserResetPasswordRequest } from '../types/user/user.reset.password.request.js';
import { DeleteUserRequest } from '../types/delete-user/delete.user.request.js';
import qs from 'qs';
import { UserRequest } from '../types/user/user.request.js';
import { UserResponse } from '../types/user/user.response.js';
import { SimpleJwtApiResult } from '../types/simple.jwt.api.result.js';
import { AxiosRequestConfig } from 'axios';

export class UserService {
  private readonly config: AuthConfig;

  constructor(config: AuthConfig) {
    this.config = config;
  }

  /**
   * Change user password
   * @param body
   * @returns
   */
  async register(
    body: UserRequest,
    options?: AxiosRequestConfig
  ): Promise<ApiResult<UserResponse>> {
    const namespace = this.config.routeNamespace ?? DEFAULT_ROUTE_NAMESPACE;
    const endpoint = `/wp-json/${namespace}/users`;

    const { data, error } = await doPost<
      SimpleJwtApiResult<UserResponse>,
      UserRequest
    >(endpoint, body, options);

    return { data: data?.data, error };
  }

  /**
   * Change user password
   * @param body
   * @returns
   */
  async changePassword(
    body: UserChangePasswordRequest,
    options?: AxiosRequestConfig
  ): Promise<ApiResult<unknown>> {
    const namespace = this.config.routeNamespace ?? DEFAULT_ROUTE_NAMESPACE;
    const endpoint = `/wp-json/${namespace}/users/reset_password`;

    const { data, error } = await doPut<unknown, UserChangePasswordRequest>(
      endpoint,
      body,
      options
    );

    return { data, error };
  }

  /**
   * Send reset password code
   * @param body
   * @returns
   */
  async resetPassword(
    body: UserResetPasswordRequest,
    options?: AxiosRequestConfig
  ): Promise<ApiResult<unknown>> {
    const namespace = this.config.routeNamespace ?? DEFAULT_ROUTE_NAMESPACE;
    const endpoint = `/wp-json/${namespace}/users/reset_password`;

    const { data, error } = await doPost<unknown, UserResetPasswordRequest>(
      endpoint,
      body,
      options
    );

    return { data, error };
  }

  async delete(
    params: DeleteUserRequest,
    options?: AxiosRequestConfig
  ): Promise<ApiResult<unknown>> {
    const namespace = this.config.routeNamespace ?? DEFAULT_ROUTE_NAMESPACE;
    const endpoint = `/wp-json/${namespace}/users`;
    const query = qs.stringify(params);
    const url = `/${endpoint}?${query}`;

    const { data, error } = await doDelete(url, options);

    return { data, error };
  }
}
