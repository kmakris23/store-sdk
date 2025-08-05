import { ProductAttributeResponse } from '../../types/store/product-attribute/product.attribute.response.js';
import { ProductAttributeTermRequest } from '../../types/store/product-attribute-term/product.attribute.term.request.js';
import qs from 'qs';
import { ApiPaginationResult } from '../../types/api.js';
import { BaseService } from '../base.service.js';
import { doGet } from '../../utilities/axios.utility.js';
import { parseLinkHeader } from '../../utilities/common.js';

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
  ): Promise<ApiPaginationResult<ProductAttributeResponse[]>> {
    const query = qs.stringify(params, { encode: true });
    const url = `/${this.endpoint}/${attributeId}/terms?${query}`;
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
}
