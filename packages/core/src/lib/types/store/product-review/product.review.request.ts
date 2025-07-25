export interface ProductReviewRequest {
  /**
   * Current page of the collection.
   */
  page?: number;
  /**
   * Maximum number of items to be returned in result set.
   * Defaults to no limit if left blank.
   */
  per_page?: number;
  /**
   * Offset the result set by a specific number of items.
   */
  offset?: number;
  /**
   * Order sort attribute ascending or descending. Allowed values: `asc`, `desc`
   */
  order?: 'asc' | 'desc';
  /**
   * Sort collection by object attribute.
   * Allowed values : `date`, `date_gmt`, `id`, `rating`, `product`
   */
  orderby?: 'date' | 'date_gmt' | 'id' | 'rating' | 'product';
  /**
   * Limit result set to reviews from specific category IDs.
   */
  category_id?: string;
  /**
   * Limit result set to reviews from specific product IDs.
   */
  product_id?: string;
}
