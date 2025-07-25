import { CartItemResponse } from '../cart-item/cart.item.response';
import { ErrorResponse } from '../error.response';
import { OrderBillingResponse } from './order.billing.response';
import { OrderCouponResponse } from './order.coupon.response';
import { OrderShippingResponse } from './order.shipping.response';
import { OrderTotalResponse } from './order.total.response';

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
