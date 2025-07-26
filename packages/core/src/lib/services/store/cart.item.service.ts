import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { CartItemResponse } from '../../types/store/cart-item/cart.item.response.js';
import { CartItemAddRequest } from '../../types/store/cart-item/cart.item.add.request.js';
import { CartItemEditRequest } from '../../types/store/cart-item/cart.item.edit.request.js';
import qs from 'qs';

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
  list(): Promise<CartItemResponse[]> {
    const url = `${this.baseUrl}/${this.endpoint}`;
    return this.axiosInstance.get<unknown, CartItemResponse[]>(url);
  }

  /**
   * Get a single cart item by its key.
   * @param key The key of the cart item to retrieve.
   * @returns {CartItemResponse}
   */
  single(key: string): Promise<CartItemResponse> {
    const url = `${this.baseUrl}/${this.endpoint}/${key}`;
    return this.axiosInstance.get<unknown, CartItemResponse>(url);
  }

  /**
   * Add Cart Item
   * @param params
   * @returns {CartItemResponse}
   */
  add(params: CartItemAddRequest): Promise<CartItemResponse> {
    const query = qs.stringify(params, { encode: true });
    const url = `${this.baseUrl}/${this.endpoint}/${query}`;
    return this.axiosInstance.post<CartItemAddRequest, CartItemResponse>(url);
  }

  /**
   * Edit Single Cart Item
   * @param params
   * @returns {CartItemResponse}
   */
  update(params: CartItemEditRequest): Promise<CartItemResponse> {
    const query = qs.stringify(params, { encode: true });
    const url = `${this.baseUrl}/${this.endpoint}/items/${query}`;
    return this.axiosInstance.post<CartItemEditRequest, CartItemResponse>(url);
  }

  /**
   * Delete Single Cart Item
   * @param key The key of the cart item to edit.
   * @returns {unknown}
   */
  remove(key: string): Promise<unknown> {
    const url = `${this.baseUrl}/${this.endpoint}/items/${key}`;
    return this.axiosInstance.delete<string, unknown>(url);
  }

  /**
   * Delete All Cart Items
   * @returns {CartItemResponse[]}
   */
  clear(): Promise<CartItemResponse[]> {
    const url = `${this.baseUrl}/${this.endpoint}`;
    return this.axiosInstance.delete<string, CartItemResponse[]>(url);
  }
}
