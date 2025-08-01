export interface LoginSocialRequest {
  provider: 'google' | 'apple' | 'facebook';
  token: string;
}
