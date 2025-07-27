import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ProductAttributeResponse } from '../../types/store/product-attribute/product.attribute.response.js';
import { doRequest } from '../../utilities/axios.utility.js';
import { ApiResult } from '../../types/api.js';

/**
 * Product Attributes API
 */
export class ProductAttributeService {
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
   * List Product Attributes
   * @returns {ProductAttributeResponse[]}
   */
  async list(): Promise<ApiResult<ProductAttributeResponse[]>> {
    const url = `${this.baseUrl}/${this.endpoint}`;
    return await doRequest<ProductAttributeResponse[]>(
      this.axiosInstance,
      url,
      { method: 'get' }
    );
  }

  /**
   * Single Product Attribute
   * @param id The ID of the attribute to retrieve.
   * @returns {ProductAttributeResponse}
   */
  async single(id: number): Promise<ApiResult<ProductAttributeResponse>> {
    const url = `${this.baseUrl}/${this.endpoint}/${id}`;
    return await doRequest<ProductAttributeResponse>(this.axiosInstance, url, {
      method: 'get',
    });
  }
}
