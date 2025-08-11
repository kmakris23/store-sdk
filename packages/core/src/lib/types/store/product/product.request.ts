import { Paginated } from '../paginated.js';

export interface ProductRequest extends Paginated {
  /**
   * Limit results to those matching a string.
   */
  search?: string;
  /**
   * Limit result set to products with specific slug(s). Use commas to separate.
   */
  slug?: string;
  /**
   * Limit response to resources created after a given ISO8601 compliant date.
   */
  after?: string;
  /**
   * Limit response to resources created before a given ISO8601 compliant date.
   */
  before?: string;
  /**
   * When limiting response using after/before, which date column to compare against.
   * Allowed values: `date`, `date_gmt`, `modified`, `modified_gmt`
   */
  date_column?: 'date' | 'date_gmt' | 'modified' | 'modified_gmt';
  /**
   * Ensure result set excludes specific IDs.
   */
  exclude?: number[];
  /**
   * Limit result set to specific ids.
   */
  include?: number[];
  /**
   * Offset the result set by a specific number of items.
   */
  offset?: number;
  /**
   * Order sort attribute ascending or descending.
   * Allowed values: `asc`, `desc`
   */
  order?: 'asc' | 'desc';
  /**
   * Sort collection by object attribute.
   * Allowed values : `date`, `modified`, `id`, `include`, `title`, `slug`, `price`, `popularity`, `rating`, `menu_order`, `comment_count`
   */
  orderby?:
    | 'date'
    | 'modified'
    | 'id'
    | 'include'
    | 'title'
    | 'slug'
    | 'price'
    | 'popularity'
    | 'rating'
    | 'menu_order'
    | 'comment_count';

  /**
   * Limit result set to those of particular parent IDs.
   */
  parent?: number[];
  /**
   * Limit result set to all items except those of a particular parent ID.
   */
  parent_exclude?: number[];
  /**
   * Limit result set to products assigned a specific type.
   */
  type?: 'simple' | 'grouped' | 'external' | 'variable' | 'variation' | string;
  /**
   * Limit result set to products with specific SKU(s). Use commas to separate.
   */
  sku?: string;
  /**
   * Limit result set to featured products.
   */
  featured?: boolean;
  /**
   * Limit result set to products assigned to categories IDs or slugs, separated by commas.
   */
  category?: string;
  /**
   * Operator to compare product category terms.
   * Allowed values: `in`, `not_in`, `and`
   */
  category_operator?: 'in' | 'not_in' | 'and';
  /**
   * Limit result set to products assigned to brands IDs or slugs, separated by commas.
   */
  brand?: string;
  /**
   * Operator to compare product brand terms.
   * Allowed values: `in`, `not_in`, `and`
   */
  brand_operator?: 'in' | 'not_in' | 'and';

  /**
   * Limit result set to products assigned to the term ID of that custom product taxonomy.
   * `[product-taxonomy]` should be the key of the custom product taxonomy registered.
   */
  _unstable_tax_?: Record<string, string>[];

  /**
   * Operator to compare custom product taxonomy terms.
   * Allowed values: `in`, `not_in`, `and`
   */
  _unstable_tax_operator?: { [key: string]: 'in' | 'not_in' | 'and' }[];

  /**
   * Limit result set to products assigned a specific tag ID.
   */
  tag?: string;
  /**
   * Operator to compare product tags.
   * Allowed values: `in`, `not_in`, `and`
   */
  tag_operator?: 'in' | 'not_in' | 'and';
  /**
   * Limit result set to products on sale.
   */
  on_sale?: boolean;
  /**
   * Limit result set to products based on a minimum price, provided using the smallest unit of the currency.
   * E.g. provide 10025 for 100.25 USD, which is a two-decimal currency, and 1025 for 1025 JPY, which is a zero-decimal currency.
   */
  min_price?: string;
  /**
   * Limit result set to products based on a maximum price, provided using the smallest unit of the currency.
   * E.g. provide 10025 for 100.25 USD, which is a two-decimal currency, and 1025 for 1025 JPY, which is a zero-decimal currency.
   */
  max_price?: string;
  /**
   * Limit result set to products with specified stock statuses.
   * Expects an array of strings containing `instock`, `outofstock` or `onbackorder`.
   */
  stock_status?: ('instock' | 'outofstock' | 'onbackorder')[];
  /**
   * Limit result set to specific attribute terms.
   * Expects an array of objects containing attribute (taxonomy), `term_id` or `slug`, and optional operator for comparison.
   */
  attributes?: 'attribute' | 'term_id' | 'slug'[];
  /**
   * The logical relationship between attributes when filtering across multiple at once.
   */
  attribute_relation?: string;
  /**
   * Determines if hidden or visible catalog products are shown.
   * Allowed values: `any`, `visible`, `catalog`, `search`, `hidden`
   */
  catalog_visibility?: 'any' | 'visible' | 'catalog' | 'search' | 'hidden';
  /**
   * Limit result set to products with a certain average rating.
   */
  rating?: number;
}
