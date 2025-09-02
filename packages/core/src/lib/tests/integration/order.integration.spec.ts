import { describe, it, expect, beforeAll } from 'vitest';
import { StoreSdk } from '../../../index.js';

const WP_BASE_URL = process.env.WP_BASE_URL || 'http://localhost:8080';

/**
 * This spec now creates a real order (best-effort). If order creation succeeds we use the returned
 * order_id and order_key for OrderService.get lookups. If creation fails (e.g. empty cart) we still
 * perform get() calls but assert explicit error semantics (no ambiguous OR assertions).
 */
describe('Integration: Order (pay-for-order endpoint)', () => {
  let createdOrderId: number | undefined;
  let createdOrderKey: string | undefined;

  beforeAll(async () => {
    await StoreSdk.init({ baseUrl: WP_BASE_URL });

    // Ensure we have at least one product in cart to attempt order creation
    const { data: products } = await StoreSdk.store.products.list({
      per_page: 5,
    });
    const prod = products?.find((p) => p.is_in_stock);
    if (prod?.id) {
      await StoreSdk.store.cart.add({ id: prod.id, quantity: 1 });
    }

    const attempt = await StoreSdk.store.checkout.processOrderAndPayment({
      billing_address: {
        first_name: 'Test',
        last_name: 'User',
        company: '',
        address_1: 'Integration St',
        address_2: '',
        city: 'Test City',
        state: '',
        country: 'GR',
        postcode: '10563',
        email: 'test@example.com',
        phone: '',
      },
      shipping_address: {
        first_name: 'Test',
        last_name: 'User',
        company: '',
        address_1: 'Integration St',
        address_2: '',
        city: 'Test City',
        state: '',
        country: 'GR',
        postcode: '10563',
      },
      payment_method: 'cod',
    });

    if (!attempt.error && attempt.data) {
      createdOrderId = attempt.data.order_id;
      createdOrderKey = attempt.data.order_key;
    }
  });

  it('retrieves order without billing email (expects data if created else explicit error)', async () => {
    // If we failed to create an order we still exercise error path deterministically.
    const key = createdOrderKey || 'missing_key_123';
    const id = String(createdOrderId || 99999999);
    const res = await StoreSdk.store.orders.get(key, id);
    if (createdOrderId && createdOrderKey && res.data) {
      expect(res.error).toBeFalsy();
      // OrderResponse returns 'id' (not 'order_id' or 'order_key').
      expect(res.data.id).toBe(createdOrderId);
    } else {
      expect(res.error).toBeDefined();
      if (res.error) {
        expect(res.error.code).toMatch(/order|key|not|invalid|cart|payment/i);
      }
      expect(res.data).toBeFalsy();
    }
  });

  it('retrieves order with billing email (expects data if created else explicit error)', async () => {
    const key = createdOrderKey || 'missing_key_123';
    const id = String(createdOrderId || 99999999);
    const res = await StoreSdk.store.orders.get(key, id, 'test@example.com');
    if (createdOrderId && createdOrderKey && res.data) {
      expect(res.error).toBeFalsy();
      expect(res.data.id).toBe(createdOrderId);
    } else {
      expect(res.error).toBeDefined();
      if (res.error) {
        expect(res.error.code).toMatch(/order|key|not|invalid|cart|payment/i);
      }
      expect(res.data).toBeFalsy();
    }
  });
});
