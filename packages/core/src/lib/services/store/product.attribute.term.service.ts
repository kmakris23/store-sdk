import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ProductAttributeResponse } from '../../types/store/product-attribute/product.attribute.response.js';
import { ProductAttributeTermRequest } from '../../types/store/product-attribute-term/product.attribute.term.request.js';
import qs from 'qs';

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
   * @returns {ProductAttributeResponse[]}
   */
  list(
    attributeId: number,
    params?: ProductAttributeTermRequest
  ): Promise<ProductAttributeResponse[]> {
    const query = qs.stringify(params, { encode: true });
    const url = `${this.baseUrl}/${this.endpoint}/${attributeId}/terms?${query}`;
    return this.axiosInstance.get<unknown, ProductAttributeResponse[]>(url);
  }
}
