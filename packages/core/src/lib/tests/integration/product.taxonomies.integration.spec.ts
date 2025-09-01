import { describe, it, expect, beforeAll } from 'vitest';
import { StoreSdk } from '../../../index.js';

const WP_BASE_URL = process.env.WP_BASE_URL || 'http://localhost:8080';

describe('Integration: Product Taxonomies (categories, tags, brands)', () => {
  beforeAll(async () => {
    await StoreSdk.init({ baseUrl: WP_BASE_URL });
  });

  it('lists product categories and fetches single (total may be undefined)', async () => {
    const { data: categories } = await StoreSdk.store.categories.list({
      per_page: 20,
    });
    expect(Array.isArray(categories)).toBe(true);
    expect((categories || []).length).toBeGreaterThan(0);
    const first = categories?.[0];
    if (first?.id) {
      const single = await StoreSdk.store.categories.single(first.id);
      expect(single.data?.id).toBe(first.id);
    }
  });

  it('lists product tags (total may be undefined)', async () => {
    const { data: tags } = await StoreSdk.store.tags.list({ per_page: 25 });
    expect(Array.isArray(tags)).toBe(true);
    expect((tags || []).length).toBeGreaterThan(0);
  });

  it('lists product brands and fetches single (total may be undefined)', async () => {
    const { data: brands } = await StoreSdk.store.brands.list({ per_page: 10 });
    expect(Array.isArray(brands)).toBe(true);
    expect((brands || []).length).toBeGreaterThan(0);
    const first = brands?.[0];
    if (first?.id) {
      const single = await StoreSdk.store.brands.single(first.id);
      expect(single.data?.id).toBe(first.id);
    }
  });

  it('handles non-existent brand gracefully', async () => {
    const res = await StoreSdk.store.brands.single(9999999);
    expect(res.data).toBeFalsy();
    expect((res as unknown as { error?: unknown }).error).toBeTruthy();
  });
});
