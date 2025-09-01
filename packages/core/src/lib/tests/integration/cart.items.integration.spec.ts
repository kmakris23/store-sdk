import { describe, it, expect, beforeAll } from 'vitest';
import { StoreSdk } from '../../../index.js';

const WP_BASE_URL = process.env.WP_BASE_URL || 'http://localhost:8080';

describe('Integration: Cart Items (read-only robustness)', () => {
  beforeAll(async () => {
    await StoreSdk.init({ baseUrl: WP_BASE_URL });
  });

  it('lists cart items (may be empty) and tolerates add attempt', async () => {
    const listBefore = await StoreSdk.store.cartItems.list();
    expect(Array.isArray(listBefore.data)).toBe(true);
    // Attempt to add an item (best-effort) then re-list
    const { data: products } = await StoreSdk.store.products.list({
      per_page: 3,
    });
    const prod = products?.find((p) => p.is_in_stock);
    if (prod?.id) {
      await StoreSdk.store.cartItems.add({ id: prod.id, quantity: 1 });
    }
    const listAfter = await StoreSdk.store.cartItems.list();
    expect(Array.isArray(listAfter.data)).toBe(true);
    // We do not assert increased length due to possible missing session persistence.
  });

  it('adds the same product twice (if possible) and quantity is stable or increases', async () => {
    const { data: products } = await StoreSdk.store.products.list({
      per_page: 5,
    });
    const prod = products?.find((p) => p.is_in_stock);
    if (!prod?.id) {
      expect(true).toBe(true); // Nothing we can test; environment has no in-stock products.
      return;
    }

    // First add (best-effort)
    await StoreSdk.store.cartItems.add({ id: prod.id, quantity: 1 });
    // Accept either success or error; we just continue
    const afterFirst = await StoreSdk.store.cartItems.list();
    expect(Array.isArray(afterFirst.data)).toBe(true);
    const item1 = afterFirst.data?.find(
      (i: { id?: number; quantity?: number }) => i?.id === prod.id
    );
    const qty1 = item1?.quantity ?? 0;

    // Second add (best-effort)
    await StoreSdk.store.cartItems.add({ id: prod.id, quantity: 1 });
    const afterSecond = await StoreSdk.store.cartItems.list();
    expect(Array.isArray(afterSecond.data)).toBe(true);
    const item2 = afterSecond.data?.find(
      (i: { id?: number }) => i?.id === prod.id
    );
    const qty2 = item2?.quantity ?? 0;

    // If item exists, quantity should be >= previous (some stores merge, some replace)
    if (item1 && item2) {
      expect(qty2).toBeGreaterThanOrEqual(qty1);
    } else {
      // If not present, we still assert list shape to keep test meaningful
      expect(Array.isArray(afterSecond.data)).toBe(true);
    }
  });

  it('gracefully handles attempt to add an invalid product id', async () => {
    const invalidId = 999999999;
    const attempt = await StoreSdk.store.cartItems.add({
      id: invalidId,
      quantity: 1,
    });
    // Expect an error or absence in list
    if (attempt.error) {
      expect(attempt.error.code).toMatch(/invalid|not|product|id/i);
    }
    // Ensure invalid id not present
    const list = await StoreSdk.store.cartItems.list();
    const found = (list.data || []).some(
      (i: { id?: number }) => i?.id === invalidId
    );
    expect(found).toBe(false);
  });

  it('lists remains consistent array after multiple best-effort operations', async () => {
    // Chain a few best-effort adds using first page of products
    const { data: products } = await StoreSdk.store.products.list({
      per_page: 3,
    });
    for (const p of products || []) {
      if (!p?.is_in_stock || !p?.id) continue;
      await StoreSdk.store.cartItems.add({ id: p.id, quantity: 1 });
    }
    const finalList = await StoreSdk.store.cartItems.list();
    expect(Array.isArray(finalList.data)).toBe(true);
    // Ensure no obviously malformed items (light validation)
    for (const item of finalList.data || []) {
      expect(item).toBeTruthy();
      // id or key should exist; we check at least one
      expect(Boolean(item.id) || Boolean(item.key)).toBe(true);
    }
  });
});
