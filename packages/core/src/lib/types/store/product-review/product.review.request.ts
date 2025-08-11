import { Paginated } from '../paginated.js';

export interface ProductReviewRequest extends Paginated {
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
