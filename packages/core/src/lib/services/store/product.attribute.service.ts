import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ProductAttributeResponse } from '../../types/store/product-attribute/product.attribute.response.js';

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
  async list(): Promise<ProductAttributeResponse[]> {
    const url = `${this.baseUrl}/${this.endpoint}`;
    const response = await this.axiosInstance.get<ProductAttributeResponse[]>(
      url
    );
    return response.data;
  }

  /**
   * Single Product Attribute
   * @param id The ID of the attribute to retrieve.
   * @returns {ProductAttributeResponse}
   */
  async single(id: number): Promise<ProductAttributeResponse> {
    const url = `${this.baseUrl}/${this.endpoint}/${id}`;
    const response = await this.axiosInstance.get<ProductAttributeResponse>(
      url
    );
    return response.data;
  }
}
