import { ProductReviewResponse } from '../../types/store/product-review/product.review.response.js';
import { ProductReviewRequest } from '../../types/store/product-review/product.review.request.js';
import qs from 'qs';
import { ApiResult } from '../../types/api.js';
import { BaseService } from '../base.service.js';
import { doGet } from '../../utilities/axios.utility.js';

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
  ): Promise<ApiResult<ProductReviewResponse[]>> {
    const query = qs.stringify(params, { encode: true });
    const url = `/${this.endpoint}?${query}`;
    const { data, error } = await doGet<ProductReviewResponse[]>(url);
    return { data, error };
  }
}
