import { Sdk } from '../sdk.js';

export type PluginId =
  | 'simple-jwt-login'
  | 'jwt-authentication-for-wp-rest-api'
  | 'hippoo';

export interface StoreSdkPlugin {
  id: PluginId;
  init(): void;
  extend(sdk: Sdk): void;
}
