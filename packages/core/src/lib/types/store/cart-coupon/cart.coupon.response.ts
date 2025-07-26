import { CartCouponTotalResponse } from './cart.coupon.total.response.js';

export interface CartCouponResponse {
  code: string;
  type: string;
  totals: CartCouponTotalResponse;
}
