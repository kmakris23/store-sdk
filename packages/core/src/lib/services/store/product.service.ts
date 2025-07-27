import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ProductRequest } from '../../types/store/product/product.request.js';
import { ProductResponse } from '../../types/store/product/product.response.js';
import { RequireAtLeastOne } from '../../utilities/common.js';
import qs from 'qs';

/**
 * Products API
 */
export class ProductService {
  private readonly baseUrl: string;
  private readonly endpoint = 'wp-json/wc/store/v1/products';
  private readonly axiosInstance: AxiosInstance;

  constructor(baseURL: string, config?: AxiosRequestConfig) {
    this.baseUrl = baseURL;
    this.axiosInstance = axios.create({
      baseURL,
      ...config,
    });
  }

  /**
   * List Products
   * @param params
   * @returns {ProductResponse[]}
   */
  async list(params?: ProductRequest): Promise<ProductResponse[]> {
    let unstable_tax = '';
    let unstable_tax_operator = '';
    if (params && params._unstable_tax_) {
      params._unstable_tax_?.forEach((item) => {
        Object.keys(item).forEach((key) => {
          unstable_tax += `_unstable_tax_${key}=${item[key]}`;
        });
      });
      params._unstable_tax_ = [];
    }

    if (params && params._unstable_tax_operator) {
      params._unstable_tax_operator?.forEach((item) => {
        Object.keys(item).forEach((key) => {
          unstable_tax_operator += `_unstable_tax_${key}_operator=${item[key]}`;
        });
      });
      params._unstable_tax_operator = [];
    }
    const query = qs.stringify(
      { params, unstable_tax, unstable_tax_operator },
      { encode: false }
    );

    const url = `${this.baseUrl}/${this.endpoint}?${query}`;
    const response = await this.axiosInstance.get<ProductResponse[]>(url);
    return response.data;
  }

  /**
   * Single Product by ID or Slug
   * @param params
   * @returns {ProductResponse}
   */
  async single(
    params: RequireAtLeastOne<{ id: number; slug: string }>
  ): Promise<ProductResponse> {
    const url = `${this.baseUrl}/${this.endpoint}/${params.id || params.slug}`;
    const response = await this.axiosInstance.get<ProductResponse>(url);
    return response.data;
  }
}
