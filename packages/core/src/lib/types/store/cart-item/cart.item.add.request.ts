export interface CartItemAddRequest {
  /**
   * The cart item product or variation ID.
   */
  id: number;
  /**
   * Quantity of this item in the cart.
   */
  quantity: number;
  /**
   * Chosen attributes (for variations) containing an array of objects with keys `attribute` and `value`.
   */
  variation?: { [key: string]: string }[];
}
