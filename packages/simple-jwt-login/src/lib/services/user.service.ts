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
  async register(body: UserRequest): Promise<ApiResult<UserResponse>> {
    const namespace = this.config.routeNamespace ?? DEFAULT_ROUTE_NAMESPACE;
    const endpoint = `${this.config.baseUrl}/wp-json/${namespace}/users`;

    const { data, error } = await doPost<
      SimpleJwtApiResult<UserResponse>,
      UserRequest
    >(endpoint, body);

    return { data: data?.data, error };
  }

  /**
   * Change user password
   * @param body
   * @returns
   */
  async changePassword(
    body: UserChangePasswordRequest
  ): Promise<ApiResult<unknown>> {
    const namespace = this.config.routeNamespace ?? DEFAULT_ROUTE_NAMESPACE;
    const endpoint = `${this.config.baseUrl}/wp-json/${namespace}/users/reset_password`;

    const { data, error } = await doPut<unknown, UserChangePasswordRequest>(
      endpoint,
      body
    );

    return { data, error };
  }

  /**
   * Send reset password code
   * @param body
   * @returns
   */
  async resetPassword(
    body: UserResetPasswordRequest
  ): Promise<ApiResult<unknown>> {
    const namespace = this.config.routeNamespace ?? DEFAULT_ROUTE_NAMESPACE;
    const endpoint = `${this.config.baseUrl}/wp-json/${namespace}/users/reset_password`;

    const { data, error } = await doPost<unknown, UserResetPasswordRequest>(
      endpoint,
      body
    );

    return { data, error };
  }

  async delete(params: DeleteUserRequest): Promise<ApiResult<unknown>> {
    const namespace = this.config.routeNamespace ?? DEFAULT_ROUTE_NAMESPACE;
    const endpoint = `${this.config.baseUrl}/wp-json/${namespace}/users`;
    const query = qs.stringify(params);
    const url = `/${endpoint}?${query}`;

    const { data, error } = await doDelete(url);

    return { data, error };
  }
}
