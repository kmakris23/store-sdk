import { CartCouponResponse } from '../cart-coupon/cart.coupon.response.js';
import { CartItemResponse } from '../cart-item/cart.item.response.js';
import { CartBillingResponse } from './cart.billing.response.js';
import { CartShippingRateResponse } from './cart.shipping.rate.response.js';
import { CartShippingResponse } from './cart.shipping.response.js';
import { CartTotalResponse } from './cart.total.response.js';

export interface CartResponse {
  items: CartItemResponse[];
  coupons: CartCouponResponse[];
  fees: unknown[];
  totals: CartTotalResponse;
  shipping_address: CartShippingResponse;
  billing_address: CartBillingResponse;
  needs_payment: boolean;
  needs_shipping: boolean;
  payment_requirements: string[];
  has_calculated_shipping: boolean;
  shipping_rates: CartShippingRateResponse[];
  items_count: number;
  items_weight: number;
  cross_sells: unknown[];
  errors: unknown[];
  payment_methods: string[];
  extensions: unknown;
}
