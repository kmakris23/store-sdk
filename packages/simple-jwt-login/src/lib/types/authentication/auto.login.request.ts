export interface AutoLoginRequest {
  /**
   * A valid JSON Web Token (JWT) required for authentication.
   */
  JWT: string;
  /**
   * Required if "Auto-Login Requires Auth Code" is enabled in the plugin settings.
   */
  AUTH_CODE?: string;
  /**
   * Custom URL to redirect the user after successful login.
   * This will override the default redirect URL set in the plugin settings.
   * Ensure the option is enabled in the plugin settings.
   */
  redirectUrl?: string;
}
