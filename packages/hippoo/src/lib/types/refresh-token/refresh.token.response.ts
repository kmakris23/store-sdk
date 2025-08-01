export interface RefreshTokenResponse {
  token: string;
  refresh_token: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}
