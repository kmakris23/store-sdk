import { ProductAttributeResponse } from '../../types/store/product-attribute/product.attribute.response.js';
import { ApiPaginationResult, ApiResult } from '../../types/api.js';
import { BaseService } from '../base.service.js';
import { doGet } from '../../utilities/axios.utility.js';
import { parseLinkHeader } from '../../utilities/common.js';

/**
 * Product Attributes API
 */
export class ProductAttributeService extends BaseService {
  private readonly endpoint = 'wp-json/wc/store/v1/products/attributes';

  /**
   * List Product Attributes
   * @returns {ProductAttributeResponse[]}
   */
  async list(): Promise<ApiPaginationResult<ProductAttributeResponse[]>> {
    const url = `/${this.endpoint}`;
    const { data, error, headers } = await doGet<ProductAttributeResponse[]>(
      url
    );

    let total, totalPages, link;
    if (headers) {
      link = parseLinkHeader(headers['link']);
      total = headers['x-wp-total'];
      totalPages = headers['x-wp-totalpages'];
    }
    return { data, error, total, totalPages, link };
  }

  /**
   * Single Product Attribute
   * @param id The ID of the attribute to retrieve.
   * @returns {ProductAttributeResponse}
   */
  async single(id: number): Promise<ApiResult<ProductAttributeResponse>> {
    const url = `/${this.endpoint}/${id}`;
    const { data, error } = await doGet<ProductAttributeResponse>(url);
    return { data, error };
  }
}
