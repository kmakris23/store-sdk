import { describe, it, expect, beforeAll } from 'vitest';
import { StoreSdk } from '../../../index.js';
import { ProductResponse } from '../../types/store/product/product.response.js';
import { CartItemResponse } from '../../types/store/cart-item/cart.item.response.js';

const WP_BASE_URL = process.env.WP_BASE_URL || 'http://localhost:8080';
const VALID_COUPON = 'SUMMER10';

/**
 * FLOW TEST: Simulates a typical guest shopper journey.
 * Steps:
 *  1. List products (paged) & pick first in-stock product
 *  2. Fetch single product detail
 *  3. Add item to cart (idempotent)
 *  4. List cart items & assert presence
 *  5. Apply valid coupon (idempotent) & verify in list
 *  6. Retrieve checkout summary (ensure fields present OR acceptable error shape)
 *  7. Place order with valid billing/shipping and assert a new order is created (order_id > 0)
 *  8. Remove coupon & confirm removal
 */

// Using concrete CartItemResponse type for stronger assertions

describe('Flow: Guest user checkout creates order', () => {
  beforeAll(async () => {
    await StoreSdk.init({ baseUrl: WP_BASE_URL });
  });

  it('executes guest checkout flow and creates an order', async () => {
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

    // 1. Aggregate products up to 5 pages to find a purchasable in-stock product
    const collected: ProductResponse[] = [];
    for (let page = 1; page <= 5; page++) {
      const res = await StoreSdk.store.products.list({ per_page: 20, page });
      if (res.error) continue;
      if (Array.isArray(res.data)) collected.push(...res.data);
      if (collected.some((p) => p.is_in_stock && p.is_purchasable)) break;
      await wait(200);
    }
    const candidates = collected.filter(
      (p) => p.is_in_stock && p.is_purchasable
    );
    expect(candidates.length).toBeGreaterThan(0);
    const product = candidates[0];
    expect(product.id).toBeTruthy();

    // 2. Add product to cart (retry across next candidates if first fails)
    const addDiagnostics: unknown[] = [];
    let addedProductId: number | null = null;
    for (const prod of candidates.slice(0, 10)) {
      const attempt = await StoreSdk.store.cart.add({
        id: prod.id,
        quantity: 1,
      });
      addDiagnostics.push({ productId: prod.id, error: attempt.error });
      if (!attempt.error) {
        addedProductId = prod.id;
        break;
      }
    }
    if (!addedProductId) {
      console.error(
        'Add to cart diagnostics:',
        JSON.stringify(addDiagnostics, null, 2)
      );
    }
    expect(
      addedProductId,
      'No purchasable product could be added to cart'
    ).toBeTruthy();

    // 3. Poll cart until item present
    const cart = await StoreSdk.store.cart.get();
    const items = (cart.data as { items?: CartItemResponse[] }).items;
    const found = items?.find((i) => i.id === addedProductId);

    if (!found) {
      const snapshot = await StoreSdk.store.cart.get();
      console.error(
        'Cart snapshot (missing item):',
        JSON.stringify(snapshot, null, 2)
      );
    }
    expect(found, 'Cart item should be present after addition').toBeTruthy();
    expect((found?.quantity ?? 0) >= 1).toBe(true);

    // 4. List cart items & assert array shape
    const cartItemsList = await StoreSdk.store.cartItems.list();
    expect(Array.isArray(cartItemsList.data)).toBe(true);
    if (Array.isArray(cartItemsList.data)) {
      const target = cartItemsList.data.find((i) => i.id === addedProductId);
      expect(target).toBeTruthy();
    }

    // 5. Apply coupon (idempotent tolerance)
    const couponApply = await StoreSdk.store.cartCoupons.add(VALID_COUPON);
    if (couponApply.error) {
      expect(couponApply.error.code).toMatch(/already|exists|applied|coupon/i);
    } else {
      expect(couponApply.data).toBeTruthy();
    }
    const couponsAfter = await StoreSdk.store.cartCoupons.list();
    const couponPresent = (couponsAfter.data || []).some(
      (c) => c.code?.toLowerCase() === VALID_COUPON.toLowerCase()
    );
    expect(couponPresent).toBe(true);

    // 6. Checkout snapshot should succeed now
    const checkoutSnapshot = await StoreSdk.store.checkout.get();
    expect(checkoutSnapshot.error).toBeFalsy();
    expect(checkoutSnapshot.data).toBeTruthy();

    // 7. Create order
    const orderAttempt = await StoreSdk.store.checkout.processOrderAndPayment({
      billing_address: {
        first_name: 'Flow',
        last_name: 'Tester',
        company: '',
        address_1: 'Syntagma Square',
        address_2: '',
        city: 'Athens',
        state: '',
        country: 'GR',
        postcode: '10563',
        email: 'flow.tester@example.com',
        phone: '+302100000000',
      },
      shipping_address: {
        first_name: 'Flow',
        last_name: 'Tester',
        company: '',
        address_1: 'Syntagma Square',
        address_2: '',
        city: 'Athens',
        state: '',
        country: 'GR',
        postcode: '10563',
      },
      payment_method: 'cod',
    });
    expect(orderAttempt.error).toBeFalsy();
    expect(orderAttempt.data?.order_id).toBeGreaterThan(0);
    expect(['pending', 'processing', 'on-hold']).toContain(
      (orderAttempt.data?.status || '').toLowerCase()
    );

    // 7b. Retrieve the order via OrderService to confirm it exists
    if (orderAttempt.data?.order_id && orderAttempt.data.order_key) {
      const fetched = await StoreSdk.store.orders.get(
        orderAttempt.data.order_key,
        String(orderAttempt.data.order_id),
        'flow.tester@example.com'
      );
      expect(fetched.error).toBeFalsy();
      expect(fetched.data?.id).toBe(orderAttempt.data.order_id);
      // Basic status consistency (case-insensitive)
      if (fetched.data?.status) {
        expect(fetched.data.status.toLowerCase()).toBe(
          orderAttempt.data.status.toLowerCase()
        );
      }
    }

    // 8. Remove coupon
    const removeCoupon = await StoreSdk.store.cartCoupons.delete(VALID_COUPON);
    if (removeCoupon.error) {
      expect(removeCoupon.error.code).toMatch(
        /invalid|not|coupon|already|exist/i
      );
    }
    const couponsAfterRemoval = await StoreSdk.store.cartCoupons.list();
    const stillPresent = (couponsAfterRemoval.data || []).some(
      (c) => c.code?.toLowerCase() === VALID_COUPON.toLowerCase()
    );
    expect(stillPresent).toBe(false);

    // 9. Final cart items list shape
    const finalCartItems = await StoreSdk.store.cartItems.list();
    expect(Array.isArray(finalCartItems.data)).toBe(true);
    if (Array.isArray(finalCartItems.data)) {
      for (const i of finalCartItems.data) {
        expect(typeof i.id).toBe('number');
        expect(typeof i.key).toBe('string');
      }
    }
  }, 30000);
});
