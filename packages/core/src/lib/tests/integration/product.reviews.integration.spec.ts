import { describe, it, expect, beforeAll } from 'vitest';
import { StoreSdk } from '../../../index.js';

const WP_BASE_URL = 'http://localhost:8080';

describe('Integration: Product Reviews', () => {
  beforeAll(async () => {
    await StoreSdk.init({ baseUrl: WP_BASE_URL });
  });

  it('lists product reviews (may be empty)', async () => {
    const { data: reviews, total } = await StoreSdk.store.reviews.list({
      per_page: 5,
    });
    expect(Array.isArray(reviews)).toBe(true);
    // No seeded reviews, so either 0 or more if manually added
    expect(Number(total) >= 0).toBe(true);
  });

  it('lists reviews with small per_page (pagination sanity)', async () => {
    const { data } = await StoreSdk.store.reviews.list({
      per_page: 2,
      page: 1,
    });
    expect(Array.isArray(data)).toBe(true);
  });
});
