import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ProductCollectionDataRequest } from '../../types/store/product-collection-data/product.collection.data.request.js';
import { ProductCollectionDataResponse } from '../../types/store/product-collection-data/product.collection.data.response.js';
import qs from 'qs';
import { doRequest } from '../../utilities/axios.utility.js';
import { ApiResult } from '../../types/api.js';

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
   * @returns
   */
  async calculate(
    params?: ProductCollectionDataRequest
  ): Promise<ApiResult<ProductCollectionDataResponse>> {
    const query = qs.stringify(params, { encode: true });
    const url = `${this.baseUrl}/${this.endpoint}?${query}`;
    return await doRequest<ProductCollectionDataResponse>(
      this.axiosInstance,
      url,
      { method: 'get' }
    );
  }
}
