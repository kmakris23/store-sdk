export interface StoreSdkConfig {
  baseUrl: string;
  nonce?: {
    disabled?: boolean;
    getToken?: () => Promise<string>;
    setToken?: (nonce: string) => Promise<void>;
  };
  cartToken?: {
    disabled?: boolean;
    getToken?: () => Promise<string>;
    setToken?: (cartToken: string) => Promise<void>;
  };
}
