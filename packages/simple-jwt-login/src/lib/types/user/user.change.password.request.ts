export interface UserChangePasswordRequest {
  email: string;
  code: string;
  newPassword: string;
  /**
   * In order to reset password with JWT, you need to check "Allow Reset password with JWT".
   * If a JWT is provided, the code parameter is no loger required.
   */
  JWT?: string;
  /**
   * Required when "AuthenticationReset Password Requires Auth Code" is enabled
   */
  AUTH_CODE?: string;
}
