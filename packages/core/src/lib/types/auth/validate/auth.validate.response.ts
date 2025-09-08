export interface AuthValidateResponse {
  valid: boolean;
  payload: {
    iss: string;
    iat: number;
    nbf: number;
    exp: number;
    sub: number;
    login: string;
    email: string;
    ver: number;
  };
}
