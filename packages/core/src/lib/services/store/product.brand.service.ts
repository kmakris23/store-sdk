import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ProductBrandResponse } from '../../types/store/product-brand/product.brand.response.js';
import { Paginated } from '../../types/store/paginated.js';
import qs from 'qs';

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
   * @returns {ProductBrandResponse[]}
   */
  async list(params?: Paginated): Promise<ProductBrandResponse[]> {
    const query = qs.stringify(params);
    const url = `${this.baseUrl}/${this.endpoint}?${query}`;
    const response = await this.axiosInstance.get<ProductBrandResponse[]>(url);
    return response.data;
  }

  /**
   * Single Product Brand
   * @param id The identifier of the brand to retrieve. Can be an brand ID or slug.
   * @returns {ProductBrandResponse}
   */
  async single(id: number): Promise<ProductBrandResponse> {
    const url = `${this.baseUrl}/${this.endpoint}/${id}`;
    const response = await this.axiosInstance.get<ProductBrandResponse>(url);
    return response.data;
  }
}
