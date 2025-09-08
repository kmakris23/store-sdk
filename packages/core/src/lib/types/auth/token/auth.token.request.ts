export interface AuthTokenRequest {
  login: string;
  password: string;
  refresh_ttl?: number;
}
