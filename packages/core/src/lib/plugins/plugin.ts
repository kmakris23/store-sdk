import { Sdk } from '../sdk.js';
import { StoreSdkConfig } from '../types/sdk.config.js';

export interface StoreSdkPlugin {
  init: (config: StoreSdkConfig) => Promise<void>;
  extend(sdk: Sdk, config: StoreSdkConfig): void;
}
