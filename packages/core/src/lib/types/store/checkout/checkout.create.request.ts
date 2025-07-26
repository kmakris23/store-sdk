import { CheckoutBillingResponse } from './checkout.billing.response';
import { CheckoutShippingResponse } from './checkout.shipping';

export interface CheckoutCreateRequest {
  /**
   * Object of updated billing address data for the customer.
   */
  billing_address: CheckoutBillingResponse;
  /**
   * Object of updated shipping address data for the customer.
   */
  shipping_address: CheckoutShippingResponse;
  /**
   * Note added to the order by the customer during checkout.
   */
  customer_note?: string;
  /**
   * The ID of the payment method being used to process the payment.
   */
  payment_method?: string;
  /**
   * Data to pass through to the payment method when processing payment.
   */
  payment_data?: {
    key: string;
    value: string;
  }[];
  /**
   * Optionally define a password for new accounts.
   */
  customer_password?: string;
  extensions?: unknown;
}
