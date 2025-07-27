import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ProductCategoryResponse } from '../../types/store/product-category/product.category.response.js';
import { ProductCategoryRequest } from '../../types/store/product-category/product.category.request.js';
import qs from 'qs';

/**
 * Product Categories API
 */
export class ProductCategoryService {
  private readonly baseUrl: string;
  private readonly endpoint = 'wp-json/wc/store/v1/products/categories';
  private readonly axiosInstance: AxiosInstance;

  constructor(baseURL: string, config?: AxiosRequestConfig) {
    this.baseUrl = baseURL;
    this.axiosInstance = axios.create({
      baseURL,
      ...config,
    });
  }

  /**
   * List Product Categories
   * @param params
   * @returns {ProductCategoryResponse[]}
   */
  async list(
    params?: ProductCategoryRequest
  ): Promise<ProductCategoryResponse[]> {
    const query = qs.stringify(params);
    const url = `${this.baseUrl}/${this.endpoint}?${query}`;
    const response = await this.axiosInstance.get<ProductCategoryResponse[]>(
      url
    );
    return response.data;
  }

  /**
   * Single Product Category
   * @param id The ID of the category to retrieve.
   * @returns {ProductCategoryResponse}
   */
  async single(id: number): Promise<ProductCategoryResponse> {
    const url = `${this.baseUrl}/${this.endpoint}/${id}`;
    const response = await this.axiosInstance.get<ProductCategoryResponse>(url);
    return response.data;
  }
}
