import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ProductCategoryResponse } from '../../types/store/product-category/product.category.response.js';

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
   * @returns {ProductCategoryResponse[]}
   */
  list(): Promise<ProductCategoryResponse[]> {
    const url = `${this.baseUrl}/${this.endpoint}`;
    return this.axiosInstance.get<unknown, ProductCategoryResponse[]>(url);
  }

  /**
   * Single Product Category
   * @param id The ID of the category to retrieve.
   * @returns {ProductCategoryResponse}
   */
  single(id: number): Promise<ProductCategoryResponse> {
    const url = `${this.baseUrl}/${this.endpoint}/${id}`;
    return this.axiosInstance.get<unknown, ProductCategoryResponse>(url);
  }
}
