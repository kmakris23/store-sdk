import { ProductRequest } from '../../types/store/product/product.request.js';
import { ProductResponse } from '../../types/store/product/product.response.js';
import { RequireAtLeastOne } from '../../utilities/common.js';
import qs from 'qs';
import { ApiResult } from '../../types/api.js';
import { BaseService } from '../base.service.js';
import { doGet } from '../../utilities/axios.utility.js';

/**
 * Products API
 *
 * The store products API provides public product data so it can be rendered on the client side.
 */
export class ProductService extends BaseService {
  private readonly endpoint = 'wp-json/wc/store/v1/products';

  /**
   * List Products
   * @param params
   * @returns
   */
  async list(params?: ProductRequest): Promise<ApiResult<ProductResponse[]>> {
    let unstable_tax: string | undefined = undefined;
    let unstable_tax_operator: string | undefined = undefined;
    if (params && params._unstable_tax_) {
      params._unstable_tax_?.forEach((item) => {
        Object.keys(item).forEach((key) => {
          unstable_tax += `_unstable_tax_${key}=${item[key]}`;
        });
      });
      params._unstable_tax_ = [];
    }

    if (params && params._unstable_tax_operator) {
      params._unstable_tax_operator?.forEach((item) => {
        Object.keys(item).forEach((key) => {
          unstable_tax_operator += `_unstable_tax_${key}_operator=${item[key]}`;
        });
      });
      params._unstable_tax_operator = [];
    }
    const query = qs.stringify(
      { ...params, unstable_tax, unstable_tax_operator },
      { encode: false }
    );

    const url = `/${this.endpoint}?${query}`;
    const { data, error } = await doGet<ProductResponse[]>(url);
    return { data, error };
  }

  /**
   * Single Product by ID or Slug
   * @param params
   * @returns
   */
  async single(
    params: RequireAtLeastOne<{ id: number; slug: string }>
  ): Promise<ApiResult<ProductResponse>> {
    const url = `/${this.endpoint}/${params.id || params.slug}`;
    const { data, error } = await doGet<ProductResponse>(url);
    return { data, error };
  }
}
