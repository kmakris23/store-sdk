import { StoreSdk } from '@store-sdk/core';

StoreSdk.init({ baseUrl: '' });
StoreSdk.products().list();
console.log('Hello World');
