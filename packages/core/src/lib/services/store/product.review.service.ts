import { ProductReviewResponse } from '../../types/store/product-review/product.review.response.js';
import { ProductReviewRequest } from '../../types/store/product-review/product.review.request.js';
import qs from 'qs';
import { ApiPaginationResult } from '../../types/api.js';
import { BaseService } from '../base.service.js';
import { doGet } from '../../utilities/axios.utility.js';
import { parseLinkHeader } from '../../utilities/common.js';

/**
 * Product Reviews API
 *
 * This endpoint returns product reviews (comments) and can also show results from either specific products or specific categories.
 */
export class ProductReviewService extends BaseService {
  private readonly endpoint = 'wp-json/wc/store/v1/products/reviews';

  /**
   * List Product Reviews
   * @param params
   * @returns
   */
  async list(
    params?: ProductReviewRequest
  ): Promise<ApiPaginationResult<ProductReviewResponse[]>> {
    const query = qs.stringify(params, { encode: true });
    const url = `/${this.endpoint}?${query}`;
    const { data, error, headers } = await doGet<ProductReviewResponse[]>(url);

    let total, totalPages, link;
    if (headers) {
      link = parseLinkHeader(headers['link']);
      total = headers['x-wp-total'];
      totalPages = headers['x-wp-totalpages'];
    }
    return { data, error, total, totalPages, link };
  }
}
