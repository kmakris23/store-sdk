export interface SignupResponse {
  token: string;
  refresh_token: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
}
