import { StoreSdk } from '@store-sdk/core/i';

StoreSdk.init({ baseUrl: '' });
StoreSdk.products().list();
console.log('Hello World');
