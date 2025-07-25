import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ProductTagResponse } from '../../types/store/product-tag/product.tag.response';

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
   * @returns {ProductTagResponse[]}
   */
  list(): Promise<ProductTagResponse[]> {
    const url = `${this.baseUrl}/${this.endpoint}`;
    return this.axiosInstance.get<{}, ProductTagResponse[]>(url);
  }
}
