import { ProductBrandResponse } from '../../types/store/product-brand/product.brand.response.js';
import { Paginated } from '../../types/store/paginated.js';
import qs from 'qs';
import { ApiResult } from '../../types/api.js';
import { BaseService } from '../base.service.js';
import { doGet } from '../../utilities/axios.utility.js';

/**
 * Product Brands API
 */
export class ProductBrandService extends BaseService {
  private readonly endpoint = 'wp-json/wc/store/v1/products/brands';

  /**
   * List Product Brands
   * @returns
   */
  async list(params?: Paginated): Promise<ApiResult<ProductBrandResponse[]>> {
    const query = qs.stringify(params);
    const url = `/${this.endpoint}?${query}`;
    const { data, error } = await doGet<ProductBrandResponse[]>(url);
    return { data, error };
  }

  /**
   * Single Product Brand
   * @param id The identifier of the brand to retrieve. Can be an brand ID or slug.
   * @returns
   */
  async single(id: number): Promise<ApiResult<ProductBrandResponse>> {
    const url = `/${this.endpoint}/${id}`;
    const { data, error } = await doGet<ProductBrandResponse>(url);
    return { data, error };
  }
}
