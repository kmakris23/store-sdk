import { ProductAttributeResponse } from '../../types/store/product-attribute/product.attribute.response.js';
import { ProductAttributeTermRequest } from '../../types/store/product-attribute-term/product.attribute.term.request.js';
import qs from 'qs';
import { ApiResult } from '../../types/api.js';
import { BaseService } from '../base.service.js';
import { doGet } from '../../utilities/axios.utility.js';

/**
 * Product Attribute Terms API
 */
export class ProductAttributeTermService extends BaseService {
  private readonly endpoint = 'wp-json/wc/store/v1/products/attributes';

  /**
   * List Attribute Terms
   * @param attributeId The ID of the attribute to retrieve terms for.
   * @param params
   * @returns
   */
  async list(
    attributeId: number,
    params?: ProductAttributeTermRequest
  ): Promise<ApiResult<ProductAttributeResponse[]>> {
    const query = qs.stringify(params, { encode: true });
    const url = `${this.baseUrl}/${this.endpoint}/${attributeId}/terms?${query}`;
    const { data, error } = await doGet<ProductAttributeResponse[]>(url);
    return { data, error };
  }
}
