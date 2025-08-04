export interface AuthConfig {
  /**
   * Defaults to `simple-jwt-login/v1`.
   */
  routeNamespace?: string;

  queryKey?: string;
  /**
   * Append JWT to query parameters.
   *
   * If the JWT is present in multiple places, the higher number of the option overwrites the smaller number.
   */
  useInQuery?: boolean;

  headerKey?: string;
  /**
   * Append JWT to headers.
   *
   * If the JWT is present in multiple places, the higher number of the option overwrites the smaller number.
   */
  useHeader?: boolean;

  authCode?: string;
  authCodeKey?: string;
  /**
   * Custom URL to redirect the user after successful login.
   * This will override the default redirect URL set in the plugin settings.
   * Ensure the option is enabled in the plugin settings.
   */
  autoLoginRedirectUrl?: string;

  getToken?: () => Promise<string>;
  setToken?: (token: string) => Promise<void>;
  clearToken?: () => Promise<void>;
}
