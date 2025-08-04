import { Sdk } from '../sdk.js';

export interface StoreSdkPlugin {
  init(): void;
  extend(sdk: Sdk): void;
}
