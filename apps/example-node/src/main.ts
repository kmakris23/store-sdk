import { StoreSdk } from '@store-sdk/core/i';

const sdk = new StoreSdk({
  baseUrl: '',
});

sdk.cart.get();
console.log('Hello World');
