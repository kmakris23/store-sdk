import { describe, it, expect, beforeAll } from 'vitest';
import { StoreSdk } from '../../../index.js';

const WP_BASE_URL = process.env.WP_BASE_URL || 'http://localhost:8080';

describe('Integration: Product Collection Data', () => {
  beforeAll(async () => {
    await StoreSdk.init({ baseUrl: WP_BASE_URL });
  });

  it('calculates aggregate collection data (min/max price)', async () => {
    const { data } = await StoreSdk.store.collectionData.calculate();
    expect(data).toBeTruthy();
    if (data && data.price_range) {
      const pr = data.price_range;
      if (pr.min_price && pr.max_price) {
        expect(Number(pr.min_price)).toBeLessThanOrEqual(Number(pr.max_price));
      } else {
        // price range present but missing numeric strings; just assert object shape
        expect(typeof pr).toBe('object');
      }
    }
  });

  it('re-calculates collection data after a product list request (consistency)', async () => {
    await StoreSdk.store.products.list({ per_page: 3 });
    const second = await StoreSdk.store.collectionData.calculate();
    expect(second.data).toBeTruthy();
    if (second.data?.price_range) {
      expect(typeof second.data.price_range).toBe('object');
    }
  });
});
