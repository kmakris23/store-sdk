import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ProductTagResponse } from '../../types/store/product-tag/product.tag.response.js';
import { ProductTagRequest } from '../../types/store/product-tag/product.tag.request.js';
import qs from 'qs';

/**
 * Product Tags API
 */
export class ProductTagService {
  private readonly baseUrl: string;
  private readonly endpoint = 'wp-json/wc/store/v1/products/tag';
  private readonly axiosInstance: AxiosInstance;

  constructor(baseURL: string, config?: AxiosRequestConfig) {
    this.baseUrl = baseURL;
    this.axiosInstance = axios.create({
      baseURL,
      ...config,
    });
  }

  /**
   * List Product Tags
   * @param params 
   * @returns {ProductTagResponse[]}
   */
  list(params: ProductTagRequest): Promise<ProductTagResponse[]> {
    const query = qs.stringify(params);
    const url = `${this.baseUrl}/${this.endpoint}?${query}`;
    return this.axiosInstance.get<unknown, ProductTagResponse[]>(url);
  }
}
