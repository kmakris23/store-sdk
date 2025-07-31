export interface HippoConfig {
  google?: {
    googleIdToken?: string;
  };
  jwt?: {
    getToken?: () => Promise<string>;
    setToken?: (token: string) => Promise<void>;
    getRefreshToken?: () => Promise<string>;
    seRefreshtToken?: (refreshToken: string) => Promise<void>;
  };
}
