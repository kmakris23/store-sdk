import { CartItemResponse } from '../../types/store/cart-item/cart.item.response.js';
import { CartItemAddRequest } from '../../types/store/cart-item/cart.item.add.request.js';
import qs from 'qs';
import { ApiResult } from '../../types/api.js';
import { BaseService } from '../base.service.js';
import { AxiosRequestConfig } from 'axios';
import {
  doDelete,
  doGet,
  doPost,
  doPut,
} from '../../utilities/axios.utility.js';

/**
 * Cart Items API
 */
export class CartItemService extends BaseService {
  private readonly endpoint = 'wp-json/wc/store/v1/cart/items';

  /**
   * List Cart Items
   * @returns {CartItemResponse[]}
   */
  async list(): Promise<ApiResult<CartItemResponse[]>> {
    const url = `/${this.endpoint}`;

    const options: AxiosRequestConfig = {};
    await this.addNonceHeader(options);
    await this.addCartTokenHeader(options);

    const { data, error, headers } = await doGet<CartItemResponse[]>(
      url,
      options
    );

    if (headers) {
      await super.nonceChanged(headers[this.NONCE_HEADER]);
    }

    return { data, error };
  }

  /**
   * Get a single cart item by its key.
   * @param key The key of the cart item to retrieve.
   * @returns {CartItemResponse}
   */
  async single(key: string): Promise<ApiResult<CartItemResponse>> {
    const url = `/${this.endpoint}/${key}`;

    const options: AxiosRequestConfig = {};
    await this.addNonceHeader(options);
    await this.addCartTokenHeader(options);

    const { data, error, headers } = await doGet<CartItemResponse>(
      url,
      options
    );

    if (headers) {
      await super.nonceChanged(headers[this.NONCE_HEADER]);
    }

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
    await this.addNonceHeader(options);
    await this.addCartTokenHeader(options);

    super.cartLoading(true);
    const { data, error, headers } = await doPost<CartItemResponse, unknown>(
      url,
      undefined,
      options
    );

    if (headers) {
      await super.nonceChanged(headers[this.NONCE_HEADER]);
    }

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
    await this.addNonceHeader(options);
    await this.addCartTokenHeader(options);

    super.cartLoading(true);
    const { data, error, headers } = await doPut<CartItemResponse, unknown>(
      url,
      undefined,
      options
    );

    if (headers) {
      await super.nonceChanged(headers[this.NONCE_HEADER]);
    }

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
    await this.addNonceHeader(options);
    await this.addCartTokenHeader(options);

    super.cartLoading(true);
    const { data, error, headers } = await doDelete<unknown>(url, options);

    if (headers) {
      await super.nonceChanged(headers[this.NONCE_HEADER]);
    }

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
    await this.addNonceHeader(options);
    await this.addCartTokenHeader(options);

    super.cartLoading(true);
    const { data, error, headers } = await doDelete<CartItemResponse[]>(
      url,
      options
    );

    if (headers) {
      await super.nonceChanged(headers[this.NONCE_HEADER]);
    }

    super.cartLoading(false);
    return { data, error };
  }
}
