import type { CartResponse } from './types/store/index.js';

export type StoreSdkEvent = {
  cartChanged: CartResponse;
  nonceChanged: string;
  cartHashChanged: string;
  cartTokenChanged: string;

  cartLoading: boolean;
};