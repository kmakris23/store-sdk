import { ProductAttributeResponse } from '../../types/store/product-attribute/product.attribute.response.js';
import { ApiResult } from '../../types/api.js';
import { BaseService } from '../base.service.js';

/**
 * Product Attributes API
 */
export class ProductAttributeService extends BaseService {
  private readonly endpoint = 'wp-json/wc/store/v1/products/attributes';

  /**
   * List Product Attributes
   * @returns {ProductAttributeResponse[]}
   */
  async list(): Promise<ApiResult<ProductAttributeResponse[]>> {
    const url = `${this.baseUrl}/${this.endpoint}`;
    const { data, error } = await this.doGet<ProductAttributeResponse[]>(url);
    return { data, error };
  }

  /**
   * Single Product Attribute
   * @param id The ID of the attribute to retrieve.
   * @returns {ProductAttributeResponse}
   */
  async single(id: number): Promise<ApiResult<ProductAttributeResponse>> {
    const url = `${this.baseUrl}/${this.endpoint}/${id}`;
    const { data, error } = await this.doGet<ProductAttributeResponse>(url);
    return { data, error };
  }
}
