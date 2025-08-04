export interface AuthRefreshRequest {
  /**
   * Expired JWT.
   */
  JWT: string;

  /**
   * Required when "Authentication Requires Auth Code" is enabled
   */
  AUTH_CODE?: string;
}
