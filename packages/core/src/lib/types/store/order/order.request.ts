import { OrderBillingResponse } from './order.billing.response';
import { OrderShippingResponse } from './order.shipping.response';

export interface OrderRequest {
  /**
   * The key for the order verification.
   */
  key: string;
  /**
   * The email address used to verify guest orders.
   */
  billing_email?: string;
  /**
   * Object of updated billing address data for the customer.
   */
  billing_address: OrderBillingResponse;
  /**
   * Object of updated shipping address data for the customer.
   */
  shipping_address: OrderShippingResponse;
  /**
   * The ID of the payment method being used to process the payment.
   */
  payment_method: string;
  /**
   * Data to pass through to the payment method when processing payment.
   */
  payment_data?: { key: string; value: string }[];
}
