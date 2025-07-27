import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ProductReviewResponse } from '../../types/store/product-review/product.review.response.js';
import { ProductReviewRequest } from '../../types/store/product-review/product.review.request.js';
import qs from 'qs';

/**
 * Product Reviews API
 */
export class ProductReviewService {
  private readonly baseUrl: string;
  private readonly endpoint = 'wp-json/wc/store/v1/products/reviews';
  private readonly axiosInstance: AxiosInstance;

  constructor(baseURL: string, config?: AxiosRequestConfig) {
    this.baseUrl = baseURL;
    this.axiosInstance = axios.create({
      baseURL,
      ...config,
    });
  }

  /**
   * List Product Reviews
   * @param params
   * @returns {ProductReviewResponse[]}
   */
  async list(params?: ProductReviewRequest): Promise<ProductReviewResponse[]> {
    const query = qs.stringify(params, { encode: true });
    const url = `${this.baseUrl}/${this.endpoint}?${query}`;
    const response = await this.axiosInstance.get<ProductReviewResponse[]>(url);
    return response.data;
  }
}
