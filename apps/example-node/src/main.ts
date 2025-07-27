import { StoreSdk } from '@store-sdk/core';
import { ProductRequest } from 'packages/core/src/lib/types/store/product/product.request';

StoreSdk.init({ baseUrl: '' });
StoreSdk.products().list({} as ProductRequest);
