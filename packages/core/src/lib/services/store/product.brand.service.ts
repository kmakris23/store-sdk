import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ProductBrandResponse } from '../../types/store/product-brand/product.brand.response.js';
import { Paginated } from '../../types/store/paginated.js';
import qs from 'qs';
import { doRequest } from '../../utilities/axios.utility.js';
import { ApiResult } from '../../types/api.js';

/**
 * Product Brands API
 */
export class ProductBrandService {
  private readonly baseUrl: string;
  private readonly endpoint = 'wp-json/wc/store/v1/products/brands';
  private readonly axiosInstance: AxiosInstance;

  constructor(baseURL: string, config?: AxiosRequestConfig) {
    this.baseUrl = baseURL;
    this.axiosInstance = axios.create({
      baseURL,
      ...config,
    });
  }

  /**
   * List Product Brands
   * @returns
   */
  async list(params?: Paginated): Promise<ApiResult<ProductBrandResponse[]>> {
    const query = qs.stringify(params);
    const url = `${this.baseUrl}/${this.endpoint}?${query}`;
    const { data, error } = await doRequest<ProductBrandResponse[]>(
      this.axiosInstance,
      url,
      {
        method: 'get',
      }
    );
    return { data, error };
  }

  /**
   * Single Product Brand
   * @param id The identifier of the brand to retrieve. Can be an brand ID or slug.
   * @returns
   */
  async single(id: number): Promise<ApiResult<ProductBrandResponse>> {
    const url = `${this.baseUrl}/${this.endpoint}/${id}`;
    const { data, error } = await doRequest<ProductBrandResponse>(
      this.axiosInstance,
      url,
      {
        method: 'get',
      }
    );
    return { data, error };
  }
}
