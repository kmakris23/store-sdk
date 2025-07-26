import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ProductBrandResponse } from '../../types/store/product-brand/product.brand.response.js';

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
  list(): Promise<ProductBrandResponse[]> {
    const url = `${this.baseUrl}/${this.endpoint}`;
    return this.axiosInstance.get<unknown, ProductBrandResponse[]>(url);
  }

  /**
   * Single Product Brand
   * @param id The identifier of the brand to retrieve. Can be an brand ID or slug.
   * @returns {ProductBrandResponse}
   */
  single(id: number): Promise<ProductBrandResponse> {
    const url = `${this.baseUrl}/${this.endpoint}/${id}`;
    return this.axiosInstance.get<unknown, ProductBrandResponse>(url);
  }
}
