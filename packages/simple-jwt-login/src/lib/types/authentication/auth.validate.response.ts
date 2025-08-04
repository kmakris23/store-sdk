export interface AuthValidateResponse {
  user: {
    ID: number;
    user_login: string;
    user_nicename: string;
    user_email: string;
    user_url: string;
    user_registered: string;
    user_activation_key: string;
    user_status: string;
    display_name: string;
    user_level: string;
  };
  roles: string[];
  jwt: {
    header: {
      type: string;
      alg: string;
    };
    payload: {
      iat: number;
      email: string;
      id: number;
      site: string;
      username: string;
    };
  };
}
