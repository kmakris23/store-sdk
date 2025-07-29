export interface StoreSdkConfig {
  baseUrl: string;
  nonceResolver?: () => Promise<string>;
  cartTokenResolver?: () => Promise<string>;
}
