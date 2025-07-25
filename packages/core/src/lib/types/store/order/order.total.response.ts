export interface OrderTotalResponse {
  subtotal: string;
  total_discount: string;
  total_shipping: string;
  total_fees: string;
  total_tax: string;
  total_refund: string;
  total_price: string;
  total_items: string;
  total_items_tax: string;
  total_fees_tax: string;
  total_discount_tax: string;
  total_shipping_tax: string;
  tax_lines: [];
}
