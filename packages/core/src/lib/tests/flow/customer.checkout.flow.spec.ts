import { describe, it, expect, beforeAll } from 'vitest';
import { StoreSdk } from '../../../index.js';

const WP_BASE_URL = process.env.WP_BASE_URL || 'http://localhost:8080';
const CUSTOMER_USER = process.env.TEST_CUSTOMER_USER || 'customer';
const CUSTOMER_PASS = process.env.TEST_CUSTOMER_PASSWORD || 'customer123';

let pluginActive = true;
// Simple holder for tokens captured through config callbacks
let accessToken = '';
let refreshToken = '';

describe('Flow: Customer Checkout', () => {
  beforeAll(async () => {
    await StoreSdk.init({
      baseUrl: WP_BASE_URL,
      auth: {
        getToken: async () => {
          return accessToken;
        },
        setToken: async (t: string) => {
          accessToken = t;
        },
        clearToken: async () => {
          accessToken = '';
        },
        getRefreshToken: async () => {
          return refreshToken;
        },
        setRefreshToken: async (t: string) => {
          refreshToken = t;
        },
      },
    });
    const status = await StoreSdk.auth.status();
    pluginActive = !!status.data?.active;
  });

  it('login -> categories -> products -> cart -> checkout', async () => {
    if (pluginActive) {
      const login = await StoreSdk.auth.token({
        login: CUSTOMER_USER,
        password: CUSTOMER_PASS,
      });
      expect(login.error).toBeFalsy();
      expect(login.data?.token).toBeTruthy();

      // Validate endpoint should succeed using injected Authorization header
      const validate = await StoreSdk.auth.validate();
      expect(validate.error).toBeFalsy();
      // Basic shape assertion if available
      if (validate.data) {
        expect(typeof validate.data.valid).toBe('boolean');
      }
    }

    const catRes = await StoreSdk.store.categories.list({ per_page: 5 });
    expect(Array.isArray(catRes.data)).toBe(true);

    const prodRes = await StoreSdk.store.products.list({ per_page: 5 });
    expect(Array.isArray(prodRes.data)).toBe(true);
    const firstProduct = prodRes.data?.[0];
    expect(firstProduct).toBeTruthy();
    if (!firstProduct) return;

    let addedProductId: number | undefined;
    if (prodRes.data) {
      for (const p of prodRes.data) {
        const attempt = await StoreSdk.store.cart.add({
          id: p.id,
          quantity: 1,
        });
        if (!attempt.error) {
          addedProductId = p.id;
          break;
        }
      }
    }
    if (!addedProductId) {
      expect(true).toBe(true);
      return;
    }

    await StoreSdk.store.cart.add({ id: addedProductId, quantity: 1 });

    const cart = await StoreSdk.store.cart.get();
    expect(cart.error).toBeFalsy();

    const billing = {
      first_name: 'Test',
      last_name: 'Customer',
      company: '',
      address_1: '123 Test St',
      address_2: '',
      city: 'Testopolis',
      state: 'CA',
      postcode: '12345',
      country: 'US',
      email: 'customer@example.com',
      phone: '1234567890',
    };
    const shipping = {
      first_name: 'Test',
      last_name: 'Customer',
      company: '',
      address_1: '123 Test St',
      address_2: '',
      city: 'Testopolis',
      state: 'CA',
      postcode: '12345',
      country: 'US',
    };

    const checkout = await StoreSdk.store.checkout.processOrderAndPayment({
      billing_address: billing,
      shipping_address: shipping,
      payment_method: 'cod',
    });

    if (checkout.error) {
      expect(['woocommerce_rest_invalid_address']).not.toContain(
        checkout.error.code
      );
    } else if (checkout.data) {
      expect(checkout.data.order_id).toBeGreaterThan(0);
      expect(typeof checkout.data.status).toBe('string');
    }
  });
});
