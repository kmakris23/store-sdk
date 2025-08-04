export interface AuthRequest {
  /**
   * Required when username and login are not provided.
   */
  email?: string;
  /**
   * Required when email and login are not provided.
   */
  username?: string;
  /**
   * User email of username. It behaves as WordPress login. Required without email and username.
   */
  login?: string;
  /**
   * User plain password. Required when pass_hash is not provided.
   */
  password?: string;
  /**
   * User hashed password from Database. Required when password is not provided.
   */
  password_hash?: string;
  AUTH_CODE?: string;
}
