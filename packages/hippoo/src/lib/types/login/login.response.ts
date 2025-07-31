export interface LoginResponse {
  token: string;
  refresh_token: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}
