import { CartItemResponse } from '../cart-item/cart.item.response.js';
import { ErrorResponse } from '../error.response.js';
import { OrderBillingResponse } from './order.billing.response.js';
import { OrderCouponResponse } from './order.coupon.response.js';
import { OrderShippingResponse } from './order.shipping.response.js';
import { OrderTotalResponse } from './order.total.response.js';

export interface OrderResponse {
  id: number;
  status: string;
  coupons: OrderCouponResponse[];
  shipping_address: OrderShippingResponse;
  billing_address: OrderBillingResponse;
  items: CartItemResponse[];
  needs_payment: boolean;
  needs_shipping: boolean;
  totals: OrderTotalResponse;
  errors: ErrorResponse[];
  payment_requirements: string[];
}
