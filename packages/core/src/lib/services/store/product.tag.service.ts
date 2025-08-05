import { ProductTagResponse } from '../../types/store/product-tag/product.tag.response.js';
import { ProductTagRequest } from '../../types/store/product-tag/product.tag.request.js';
import qs from 'qs';
import { ApiPaginationResult } from '../../types/api.js';
import { BaseService } from '../base.service.js';
import { doGet } from '../../utilities/axios.utility.js';
import { parseLinkHeader } from '../../utilities/common.js';

/**
 * Product Tags API
 */
export class ProductTagService extends BaseService {
  private readonly endpoint = 'wp-json/wc/store/v1/products/tags';

  /**
   * List Product Tags
   * @param params
   * @returns
   */
  async list(
    params?: ProductTagRequest
  ): Promise<ApiPaginationResult<ProductTagResponse[]>> {
    const query = qs.stringify(params);
    const url = `/${this.endpoint}?${query}`;
    const { data, error, headers } = await doGet<ProductTagResponse[]>(url);

    let total, totalPages, link;
    if (headers) {
      link = parseLinkHeader(headers['link']);
      total = headers['x-wp-total'];
      totalPages = headers['x-wp-totalpages'];
    }
    return { data, error, total, totalPages, link };
  }
}
