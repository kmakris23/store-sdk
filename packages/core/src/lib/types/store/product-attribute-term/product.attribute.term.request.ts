export interface ProductAttributeTermRequest {
  /**
   * The ID of the attribute to retrieve terms for.
   */
  id: number;
  /**
   * Order ascending or descending.
   * Allowed values: `asc`, `desc`
   */
  order: 'asc' | 'desc';
  /**
   * Sort collection by object attribute.
   * Allowed values: `id`, `name`, `name_num`, `slug`, `count`, `menu_order`.
   */
  orderby: 'id' | 'name' | 'name_num' | 'slug' | 'count' | 'menu_order';
}
