import { CheckoutBillingResponse } from './checkout.billing.response';
import { CheckoutShippingResponse } from './checkout.shipping';

export interface CheckoutResponse {
  order_id: number;
  status: string;
  order_key: string;
  customer_note: string;
  customer_id: number;
  billing_address: CheckoutBillingResponse;
  shipping_address: CheckoutShippingResponse;
  payment_method: string;
  payment_result: {
    payment_status: string;
    payment_details: [];
    redirect_url: string;
  };
  additional_fields: { [key: string]: string }[];
  __experimentalCart: unknown;
  extensions: {};
}
