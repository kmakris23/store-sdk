import { ProductTagResponse } from '../../types/store/product-tag/product.tag.response.js';
import { ProductTagRequest } from '../../types/store/product-tag/product.tag.request.js';
import qs from 'qs';
import { ApiResult } from '../../types/api.js';
import { BaseService } from '../base.service.js';
import { doGet } from '../../utilities/axios.utility.js';

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
  ): Promise<ApiResult<ProductTagResponse[]>> {
    const query = qs.stringify(params);
    const url = `/${this.endpoint}?${query}`;
    const { data, error } = await doGet<ProductTagResponse[]>(url);
    return { data, error };
  }
}
