export interface CartItemEditRequest {
  /**
   * The key of the cart item to edit.
   */
  key: string;
  /**
   * Quantity of this item in the cart.
   */
  quantity: number;
}
