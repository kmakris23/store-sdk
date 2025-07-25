export interface CheckoutUpdateRequest {
  /**
   * Name => value pairs of additional fields to update.
   */
  additional_fields?: { [key: string]: string }[];
  /**
   * The ID of the payment method selected.
   */
  payment_method?: string;
  /**
   * Order notes.
   */
  order_notes?: string;
}
