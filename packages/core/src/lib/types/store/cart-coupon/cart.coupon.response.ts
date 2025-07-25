import { CartCouponTotalResponse } from './cart.coupon.total.response';

export interface CartCouponResponse {
  code: string;
  type: string;
  totals: CartCouponTotalResponse;
}
