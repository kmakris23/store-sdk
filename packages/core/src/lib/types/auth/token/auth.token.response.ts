export interface AuthTokenResponse {
  token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  refresh_expires_in: number;
  user: {
    id: number;
    login: string;
    email: string;
    display_name: string;
  };
}
