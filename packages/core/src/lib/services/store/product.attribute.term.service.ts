import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ProductAttributeResponse } from '../../types/store/product-attribute/product.attribute.response.js';
import { ProductAttributeTermRequest } from '../../types/store/product-attribute-term/product.attribute.term.request.js';
import qs from 'qs';
import { doRequest } from '../../utilities/axios.utility.js';
import { ApiResult } from '../../types/api.js';

/**
 * Product Attribute Terms API
 */
export class ProductAttributeTermService {
  private readonly baseUrl: string;
  private readonly endpoint = 'wp-json/wc/store/v1/products/attributes';
  private readonly axiosInstance: AxiosInstance;

  constructor(baseURL: string, config?: AxiosRequestConfig) {
    this.baseUrl = baseURL;
    this.axiosInstance = axios.create({
      baseURL,
      ...config,
    });
  }

  /**
   * List Attribute Terms
   * @param attributeId The ID of the attribute to retrieve terms for.
   * @param params
   * @returns
   */
  async list(
    attributeId: number,
    params?: ProductAttributeTermRequest
  ): Promise<ApiResult<ProductAttributeResponse[]>> {
    const query = qs.stringify(params, { encode: true });
    const url = `${this.baseUrl}/${this.endpoint}/${attributeId}/terms?${query}`;
    const { data, error } = await doRequest<ProductAttributeResponse[]>(
      this.axiosInstance,
      url,
      { method: 'get' }
    );
    return { data, error };
  }
}
