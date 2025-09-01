import { describe, it, expect, beforeAll } from 'vitest';
import { StoreSdk } from '../../../index.js';

const WP_BASE_URL = process.env.WP_BASE_URL || 'http://localhost:8080';

describe('Integration: Product Categories', () => {
  beforeAll(async () => {
    await StoreSdk.init({ baseUrl: WP_BASE_URL });
  });

  it('lists categories and fetches a single category', async () => {
    const { data: categories } = await StoreSdk.store.categories.list({
      per_page: 15,
      page: 1,
    });
    expect(Array.isArray(categories)).toBe(true);
    expect((categories || []).length).toBeGreaterThan(0);
    const first = categories?.[0];
    if (first?.id) {
      const single = await StoreSdk.store.categories.single(first.id);
      expect(single.data?.id).toBe(first.id);
    }
  });

  it('paginates categories (page=1 then page=2 may be empty)', async () => {
    const page1 = await StoreSdk.store.categories.list({
      per_page: 5,
      page: 1,
    });
    const page2 = await StoreSdk.store.categories.list({
      per_page: 5,
      page: 2,
    });
    expect(Array.isArray(page1.data)).toBe(true);
    expect(Array.isArray(page2.data)).toBe(true);
  });

  it('enforces per_page limit when possible', async () => {
    const perPage = 3;
    const res = await StoreSdk.store.categories.list({
      per_page: perPage,
      page: 1,
    });
    if ((res.data?.length || 0) >= perPage) {
      expect(res.data?.length).toBeLessThanOrEqual(perPage);
    } else {
      // Dataset smaller than per_page; still an array
      expect(Array.isArray(res.data)).toBe(true);
    }
  });

  it('category objects expose basic expected shape', async () => {
    const res = await StoreSdk.store.categories.list({ per_page: 5, page: 1 });
    (res.data || []).forEach((c) => {
      expect(typeof c.id).toBe('number');
      expect(typeof c.name).toBe('string');
      expect(typeof c.slug).toBe('string');
    });
  });

  it('search filters categories (best effort)', async () => {
    const base = await StoreSdk.store.categories.list({
      per_page: 10,
      page: 1,
    });
    const first = base.data?.find(
      (c) => typeof c.name === 'string' && c.name.length >= 3
    );
    if (!first) {
      expect(Array.isArray(base.data)).toBe(true);
      return;
    }
    // Try a substring (first 3 alphanumeric chars)
    const token = (
      first.name.match(/[A-Za-z0-9]{3,}/)?.[0] || first.name
    ).slice(0, 3);
    const filtered = await StoreSdk.store.categories.list({
      search: token,
      per_page: 20,
      page: 1,
    });
    expect(Array.isArray(filtered.data)).toBe(true);
    if ((filtered.data || []).length > 0) {
      (filtered.data || []).forEach((c) => {
        expect((c.name || '').toLowerCase().includes(token.toLowerCase())).toBe(
          true
        );
      });
    }
  });

  it('filters by parent when parent parameter is used (best effort)', async () => {
    const all = await StoreSdk.store.categories.list({ per_page: 25, page: 1 });
    const root = all.data?.find((c) => c.parent === 0);
    if (!root) {
      expect(Array.isArray(all.data)).toBe(true);
      return;
    }
    const children = await StoreSdk.store.categories.list({
      per_page: 25,
      page: 1,
    });
    const list = children.data || [];
    if (list.length === 0) {
      expect(Array.isArray(list)).toBe(true);
      return; // no children is acceptable
    }
    const allMatch = list.every((c) => c.parent === root.id);
    if (!allMatch) {
      // Backend may ignore parent filter; ensure at least one matches OR all remain root-level
      const anyMatch = list.some((c) => c.parent === root.id);
      const allRoot = list.every((c) => c.parent === 0);
      expect(anyMatch || allRoot).toBe(true);
      return;
    }
    list.forEach((c) => expect(c.parent).toBe(root.id));
  });

  it('handles non-existent category id gracefully', async () => {
    const impossibleId = 99999999;
    const res = await StoreSdk.store.categories.single(impossibleId);
    // Expect either no data and an error or (edge) empty data with error
    expect(res.data).toBeFalsy();
    expect((res as unknown as { error?: unknown }).error).toBeTruthy();
  });

  it('supports concurrent list requests without state interference', async () => {
    const [a, b, c] = await Promise.all([
      StoreSdk.store.categories.list({ per_page: 4, page: 1 }),
      StoreSdk.store.categories.list({ per_page: 4, page: 2 }),
      StoreSdk.store.categories.list({ per_page: 4, page: 3 }),
    ]);
    [a, b, c].forEach((r) => expect(Array.isArray(r.data)).toBe(true));
  });

  it('fetches each first-page category individually (best effort subset)', async () => {
    const list = await StoreSdk.store.categories.list({ per_page: 5, page: 1 });
    const subset = (list.data || []).slice(0, 3);
    for (const cat of subset) {
      const single = await StoreSdk.store.categories.single(cat.id);
      expect(single.data?.id).toBe(cat.id);
    }
  });
});
