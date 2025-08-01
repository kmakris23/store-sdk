import { ProductCategoryResponse } from '../../types/store/product-category/product.category.response.js';
import { ProductCategoryRequest } from '../../types/store/product-category/product.category.request.js';
import qs from 'qs';
import { ApiResult } from '../../types/api.js';
import { BaseService } from '../base.service.js';
import { doGet } from '../../utilities/axios.utility.js';

/**
 * Product Categories API
 */
export class ProductCategoryService extends BaseService {
  private readonly endpoint = 'wp-json/wc/store/v1/products/categories';

  /**
   * List Product Categories
   * @param params
   * @returns
   */
  async list(
    params?: ProductCategoryRequest
  ): Promise<ApiResult<ProductCategoryResponse[]>> {
    const query = qs.stringify(params);
    const url = `${this.baseUrl}/${this.endpoint}?${query}`;
    const { data, error } = await doGet<ProductCategoryResponse[]>(url);
    return { data, error };
  }

  /**
   * Single Product Category
   * @param id The ID of the category to retrieve.
   * @returns
   */
  async single(id: number): Promise<ApiResult<ProductCategoryResponse>> {
    const url = `${this.baseUrl}/${this.endpoint}/${id}`;
    const { data, error } = await doGet<ProductCategoryResponse>(url);
    return { data, error };
  }
}
