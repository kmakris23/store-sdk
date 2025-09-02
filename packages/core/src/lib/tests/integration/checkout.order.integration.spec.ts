import { describe, it, expect, beforeAll } from 'vitest';
import { StoreSdk } from '../../../index.js';

const WP_BASE_URL = process.env.WP_BASE_URL || 'http://localhost:8080';

describe('Integration: Checkout & Order', () => {
  beforeAll(async () => {
    await StoreSdk.init({ baseUrl: WP_BASE_URL });
  });

  async function ensureCartItem() {
    const { data: products } = await StoreSdk.store.products.list({
      per_page: 3,
    });
    const prod = products?.find((p) => p.is_in_stock);
    if (prod?.id) {
      await StoreSdk.store.cart.add({ id: prod.id, quantity: 1 });
    }
  }

  it('retrieves checkout data or empty-cart error', async () => {
    const checkout = await StoreSdk.store.checkout.get();
    if (checkout.error) {
      // Expect a recognizable checkout/cart related error code
      expect(checkout.error.code).toMatch(
        /cart|empty|checkout|nonce|required/i
      );
      expect(checkout.data).toBeFalsy();
    } else {
      expect(checkout.data).toBeTruthy();
      if (checkout.data) {
        // order_id may be undefined pre-submit; just ensure object shape
        expect(typeof checkout.data).toBe('object');
      }
    }
  });

  it('fails to process order with missing billing fields (expect error)', async () => {
    const attempt = await StoreSdk.store.checkout.processOrderAndPayment({
      billing_address: {
        first_name: '',
        last_name: '',
        company: '',
        address_1: '',
        address_2: '',
        city: '',
        state: '',
        country: 'GR',
        postcode: '',
        email: 'invalid',
        phone: '',
      },
      shipping_address: {
        first_name: '',
        last_name: '',
        company: '',
        address_1: '',
        address_2: '',
        city: '',
        state: '',
        country: 'GR',
        postcode: '',
      },
      payment_method: 'cod',
    });
    expect(attempt.error).toBeTruthy();
    if (attempt.error) {
      expect(attempt.error.code).toMatch(
        /invalid|required|billing|email|address/i
      );
    }
    expect(attempt.data).toBeFalsy();
  });

  it('updates checkout (order notes) best-effort', async () => {
    const upd = await StoreSdk.store.checkout.update({
      order_notes: 'Integration test note',
    });
    // Accept success or empty cart error
    if (upd.error) {
      expect(upd.error.code).toBeDefined();
    } else {
      expect(upd.data).toBeTruthy();
    }
  });

  it('attempts to process order (best-effort, may not finalize)', async () => {
    await ensureCartItem();
    const create = await StoreSdk.store.checkout.processOrderAndPayment({
      billing_address: {
        first_name: 'Test',
        last_name: 'User',
        company: '',
        address_1: 'Syntagma Square',
        address_2: '',
        city: 'Athens',
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
        address_1: 'Syntagma Square',
        address_2: '',
        city: 'Athens',
        state: '',
        country: 'GR',
        postcode: '10563',
      },
      payment_method: 'cod', // cash on delivery configured by provisioning script
    });
    if (create.error) {
      // Expect recognizable error code (nonce/state/cart/payment validation)
      expect(create.error.code).toMatch(
        /nonce|payment|cart|empty|invalid|required/i
      );
      expect(create.data).toBeFalsy();
    } else {
      expect(create.data).toBeTruthy();
      if (create.data) {
        expect(typeof create.data).toBe('object');
      }
    }
  });
});
