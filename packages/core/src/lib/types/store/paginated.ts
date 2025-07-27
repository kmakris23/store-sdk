export interface Paginated {
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
}
