import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ProductCategoryResponse } from '../../types/store/product-category/product.category.response.js';
import { ProductCategoryRequest } from '../../types/store/product-category/product.category.request.js';
import qs from 'qs';
import { doRequest } from '../../utilities/axios.utility.js';
import { ApiResult } from '../../types/api.js';

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
   * @returns
   */
  async list(
    params?: ProductCategoryRequest
  ): Promise<ApiResult<ProductCategoryResponse[]>> {
    const query = qs.stringify(params);
    const url = `${this.baseUrl}/${this.endpoint}?${query}`;
    const { data, error } = await doRequest<ProductCategoryResponse[]>(
      this.axiosInstance,
      url,
      {
        method: 'get',
      }
    );
    return { data, error };
  }

  /**
   * Single Product Category
   * @param id The ID of the category to retrieve.
   * @returns
   */
  async single(id: number): Promise<ApiResult<ProductCategoryResponse>> {
    const url = `${this.baseUrl}/${this.endpoint}/${id}`;
    const { data, error } = await doRequest<ProductCategoryResponse>(
      this.axiosInstance,
      url,
      {
        method: 'get',
      }
    );
    return { data, error };
  }
}
