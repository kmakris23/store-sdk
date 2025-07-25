import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ProductRequest } from '../../types/store/product/product.request';
import { ProductResponse } from '../../types/store/product/product.response';
import { RequireAtLeastOne } from '../../utilities/common';
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
  list(params?: ProductRequest): Promise<ProductResponse[]> {
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
    return this.axiosInstance.get<ProductRequest, ProductResponse[]>(url);
  }

  /**
   * Single Product by ID or Slug
   * @param params 
   * @returns {ProductResponse}
   */
  single(
    params: RequireAtLeastOne<{ id: number; slug: string }>
  ): Promise<ProductResponse> {
    const url = `${this.baseUrl}/${this.endpoint}/${params.id || params.slug}`;
    return this.axiosInstance.get<ProductRequest, ProductResponse>(url);
  }
}
