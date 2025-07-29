import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { CartItemResponse } from '../../types/store/cart-item/cart.item.response.js';
import { CartItemAddRequest } from '../../types/store/cart-item/cart.item.add.request.js';
import { CartItemEditRequest } from '../../types/store/cart-item/cart.item.edit.request.js';
import qs from 'qs';
import { ApiResult } from '../../types/api.js';
import { doRequest } from '../../utilities/axios.utility.js';

/**
 * Cart Items API
 */
export class CartItemService {
  private readonly baseUrl: string;
  private readonly endpoint = 'wp-json/wc/store/v1/cart/items';
  private readonly axiosInstance: AxiosInstance;

  constructor(baseURL: string, config?: AxiosRequestConfig) {
    this.baseUrl = baseURL;
    this.axiosInstance = axios.create({
      baseURL,
      ...config,
    });
  }

  /**
   * List Cart Items
   * @returns {CartItemResponse[]}
   */
  async list(): Promise<ApiResult<CartItemResponse[]>> {
    const url = `${this.baseUrl}/${this.endpoint}`;
    const { data, error } = await doRequest<CartItemResponse[]>(
      this.axiosInstance,
      url,
      {
        method: 'get',
      }
    );
    return { data, error };
  }

  /**
   * Get a single cart item by its key.
   * @param key The key of the cart item to retrieve.
   * @returns {CartItemResponse}
   */
  async single(key: string): Promise<ApiResult<CartItemResponse>> {
    const url = `${this.baseUrl}/${this.endpoint}/${key}`;
    const { data, error } = await doRequest<CartItemResponse>(
      this.axiosInstance,
      url,
      {
        method: 'get',
      }
    );
    return { data, error };
  }

  /**
   * Add Cart Item
   * @param params
   * @returns {CartItemResponse}
   */
  async add(params: CartItemAddRequest): Promise<ApiResult<CartItemResponse>> {
    const query = qs.stringify(params, { encode: true });
    const url = `${this.baseUrl}/${this.endpoint}/${query}`;
    const { data, error } = await doRequest<CartItemResponse>(
      this.axiosInstance,
      url,
      {
        method: 'post',
      }
    );
    return { data, error };
  }

  /**
   * Edit Single Cart Item
   * @param params
   * @returns {CartItemResponse}
   */
  async update(
    params: CartItemEditRequest
  ): Promise<ApiResult<CartItemResponse>> {
    const query = qs.stringify(params, { encode: true });
    const url = `${this.baseUrl}/${this.endpoint}/items/${query}`;
    const { data, error } = await doRequest<CartItemResponse>(
      this.axiosInstance,
      url,
      {
        method: 'post',
      }
    );
    return { data, error };
  }

  /**
   * Delete Single Cart Item
   * @param key The key of the cart item to edit.
   * @returns {unknown}
   */
  async remove(key: string): Promise<ApiResult<unknown>> {
    const url = `${this.baseUrl}/${this.endpoint}/items/${key}`;
    const { data, error } = await doRequest<unknown>(this.axiosInstance, url, {
      method: 'delete',
    });
    return { data, error };
  }

  /**
   * Delete All Cart Items
   * @returns {CartItemResponse[]}
   */
  async clear(): Promise<ApiResult<CartItemResponse[]>> {
    const url = `${this.baseUrl}/${this.endpoint}`;
    const { data, error } = await doRequest<CartItemResponse[]>(
      this.axiosInstance,
      url,
      {
        method: 'delete',
      }
    );
    return { data, error };
  }
}
