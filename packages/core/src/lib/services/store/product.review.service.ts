import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ProductReviewResponse } from '../../types/store/product-review/product.review.response';
import { ProductReviewRequest } from '../../types/store/product-review/product.review.request';
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
  list(params?: ProductReviewRequest): Promise<ProductReviewResponse[]> {
    const query = qs.stringify(params, { encode: true });
    const url = `${this.baseUrl}/${this.endpoint}?${query}`;
    return this.axiosInstance.get<{}, ProductReviewResponse[]>(url);
  }
}
