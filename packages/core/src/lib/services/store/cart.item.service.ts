import { CartItemResponse } from '../../types/store/cart-item/cart.item.response.js';
import { CartItemAddRequest } from '../../types/store/cart-item/cart.item.add.request.js';
import qs from 'qs';
import { ApiPaginationResult, ApiResult } from '../../types/api.js';
import { BaseService } from '../base.service.js';
import { AxiosRequestConfig } from 'axios';
import {
  doDelete,
  doGet,
  doPost,
  doPut,
} from '../../utilities/axios.utility.js';
import { parseLinkHeader } from '../../utilities/common.js';

/**
 * Cart Items API
 */
export class CartItemService extends BaseService {
  private readonly endpoint = 'wp-json/wc/store/v1/cart/items';

  /**
   * List Cart Items
   * @returns {CartItemResponse[]}
   */
  async list(): Promise<ApiPaginationResult<CartItemResponse[]>> {
    const url = `/${this.endpoint}`;

    const options: AxiosRequestConfig = {};

    const { data, error, headers } = await doGet<CartItemResponse[]>(
      url,
      options
    );

    let total, totalPages, link;
    if (headers) {
      link = parseLinkHeader(headers['link']);
      total = headers['x-wp-total'];
      totalPages = headers['x-wp-totalpages'];
    }

    return { data, error, total, totalPages, link };
  }

  /**
   * Get a single cart item by its key.
   * @param key The key of the cart item to retrieve.
   * @returns {CartItemResponse}
   */
  async single(key: string): Promise<ApiResult<CartItemResponse>> {
    const url = `/${this.endpoint}/${key}`;

    const options: AxiosRequestConfig = {};

    const { data, error } = await doGet<CartItemResponse>(url, options);

    return { data, error };
  }

  /**
   * Add Cart Item
   * @param params
   * @returns {CartItemResponse}
   */
  async add(params: CartItemAddRequest): Promise<ApiResult<CartItemResponse>> {
    const query = qs.stringify(params, { encode: true });
    const url = `/${this.endpoint}?${query}`;

    const options: AxiosRequestConfig = {};

    super.cartLoading(true);
    const { data, error } = await doPost<CartItemResponse, unknown>(
      url,
      undefined,
      options
    );

    super.cartLoading(false);
    return { data, error };
  }

  /**
   * Edit Single Cart Item
   * @param key The key of the cart item to edit.
   * @param quantity Quantity of this item in the cart.
   * @returns {CartItemResponse}
   */
  async update(
    key: string,
    quantity: number
  ): Promise<ApiResult<CartItemResponse>> {
    const query = qs.stringify({ quantity: quantity }, { encode: true });
    const url = `/${this.endpoint}/${key}?${query}`;

    const options: AxiosRequestConfig = {};

    super.cartLoading(true);
    const { data, error } = await doPut<CartItemResponse, unknown>(
      url,
      undefined,
      options
    );

    super.cartLoading(false);
    return { data, error };
  }

  /**
   * Delete Single Cart Item
   * @param key The key of the cart item to edit.
   * @returns {unknown}
   */
  async remove(key: string): Promise<ApiResult<unknown>> {
    const url = `/${this.endpoint}/${key}`;

    const options: AxiosRequestConfig = {};

    super.cartLoading(true);
    const { data, error } = await doDelete<unknown>(url, options);

    super.cartLoading(false);
    return { data, error };
  }

  /**
   * Delete All Cart Items
   * @returns {CartItemResponse[]}
   */
  async clear(): Promise<ApiResult<CartItemResponse[]>> {
    const url = `/${this.endpoint}`;

    const options: AxiosRequestConfig = {};

    super.cartLoading(true);
    const { data, error } = await doDelete<CartItemResponse[]>(url, options);

    super.cartLoading(false);
    return { data, error };
  }
}
