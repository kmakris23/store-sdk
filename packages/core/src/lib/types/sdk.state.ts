import { CartResponse } from './store/index.js';

export interface StoreSdkState {
  cart?: CartResponse;
  nonce?: string;
  cartHash?: string;
  cartToken?: string;
}
