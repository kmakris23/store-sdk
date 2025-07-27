import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ProductCollectionDataRequest } from '../../types/store/product-collection-data/product.collection.data.request.js';
import { ProductCollectionDataResponse } from '../../types/store/product-collection-data/product.collection.data.response.js';
import qs from 'qs';

/**
 * Product Collection Data API
 */
export class ProductCollectionDataService {
  private readonly baseUrl: string;
  private readonly endpoint = 'wp-json/wc/store/v1/products/collection-data';
  private readonly axiosInstance: AxiosInstance;

  constructor(baseURL: string, config?: AxiosRequestConfig) {
    this.baseUrl = baseURL;
    this.axiosInstance = axios.create({
      baseURL,
      ...config,
    });
  }

  /**
   * Calculate
   * @param params
   * @returns {ProductCollectionDataResponse}
   */
  async calculate(
    params?: ProductCollectionDataRequest
  ): Promise<ProductCollectionDataResponse> {
    const query = qs.stringify(params, { encode: true });
    const url = `${this.baseUrl}/${this.endpoint}?${query}`;
    const response =
      await this.axiosInstance.get<ProductCollectionDataResponse>(url);
    return response.data;
  }
}
