export interface UserResponse {
  /**
   * User numeric ID from the database
   */
  id: number;
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
  jwt: string;
}
