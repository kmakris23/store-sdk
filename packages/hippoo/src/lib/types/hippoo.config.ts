export interface HippoConfig {
  tokenKey?: string;
  refreshTokenKey?: string;
  getToken?: () => Promise<string>;
  setToken?: (token: string) => Promise<void>;
  getRefreshToken?: () => Promise<string>;
  seRefreshtToken?: (refreshToken: string) => Promise<void>;
}
