import '@store-sdk/core';
import { HippoService } from './hippoo.service.js';

declare module '@store-sdk/core' {
  interface Sdk {
    hippoo: HippoService;
  }
  interface StoreSdkState {
    isAuthenticated?: boolean;
  }
}