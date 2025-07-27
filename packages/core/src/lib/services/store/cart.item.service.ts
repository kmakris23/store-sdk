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
  async list(): Promise<CartItemResponse[]> {
    const url = `${this.baseUrl}/${this.endpoint}`;
    const response = await this.axiosInstance.get<CartItemResponse[]>(url);
    return response.data;
  }

  /**
   * Get a single cart item by its key.
   * @param key The key of the cart item to retrieve.
   * @returns {CartItemResponse}
   */
  async single(key: string): Promise<CartItemResponse> {
    const url = `${this.baseUrl}/${this.endpoint}/${key}`;
    const response = await this.axiosInstance.get<CartItemResponse>(url);
    return response.data;
  }

  /**
   * Add Cart Item
   * @param params
   * @returns {CartItemResponse}
   */
  async add(params: CartItemAddRequest): Promise<CartItemResponse> {
    const query = qs.stringify(params, { encode: true });
    const url = `${this.baseUrl}/${this.endpoint}/${query}`;
    const response = await this.axiosInstance.post<CartItemResponse>(url);
    return response.data;
  }

  /**
   * Edit Single Cart Item
   * @param params
   * @returns {CartItemResponse}
   */
  async update(params: CartItemEditRequest): Promise<CartItemResponse> {
    const query = qs.stringify(params, { encode: true });
    const url = `${this.baseUrl}/${this.endpoint}/items/${query}`;
    const response = await this.axiosInstance.post<CartItemResponse>(url);
    return response.data;
  }

  /**
   * Delete Single Cart Item
   * @param key The key of the cart item to edit.
   * @returns {unknown}
   */
  async remove(key: string): Promise<unknown> {
    const url = `${this.baseUrl}/${this.endpoint}/items/${key}`;
    const response = await this.axiosInstance.delete<unknown>(url);
    return response.data;
  }

  /**
   * Delete All Cart Items
   * @returns {CartItemResponse[]}
   */
  async clear(): Promise<CartItemResponse[]> {
    const url = `${this.baseUrl}/${this.endpoint}`;
    const response = await this.axiosInstance.delete<CartItemResponse[]>(url);
    return response.data;
  }
}
