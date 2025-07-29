import { CartResponse } from '../../types/store/cart/cart.response.js';
import { CartItemAddRequest } from '../../types/store/cart-item/cart.item.add.request.js';
import { CartCustomerRequest } from '../../types/store/cart/cart.customer.request.js';
import qs from 'qs';
import { ApiResult } from '../../types/api.js';
import { BaseService } from '../base.service.js';
import { AxiosRequestConfig } from 'axios';

/**
 * Cart API
 *
 * The cart API returns the current state of the cart for the current session or logged in user.
 */
export class CartService extends BaseService {
  private readonly endpoint = 'wp-json/wc/store/v1/cart';

  /**
   * Get Cart
   * @returns {CartResponse}
   */
  async get(): Promise<ApiResult<CartResponse>> {
    const url = `${this.baseUrl}/${this.endpoint}`;

    const { data, error, headers } = await this.doGet<CartResponse>(url);

    super.cartChanged(data);
    if (headers) {
      await super.nonceChanged(headers['nonce']);
      await super.cartTokenChanged(headers['cart-token']);
    }
    return { data, error };
  }

  /**
   * Add Item
   * @param params
   * @returns {CartResponse}
   */
  async add(params: CartItemAddRequest): Promise<ApiResult<CartResponse>> {
    const query = qs.stringify(params, { encode: true });
    const url = `${this.baseUrl}/${this.endpoint}/add-item?${query}`;

    const options: AxiosRequestConfig = {};
    this.addNonceHeader(options);
    this.addCartTokenHeader(options);

    const { data, error } = await this.doPost<CartResponse, unknown>(
      url,
      undefined,
      options
    );

    super.cartChanged(data);
    return { data, error };
  }

  /**
   * Update Item
   * @param key The key of the cart item to edit.
   * @param quantity Quantity of this item in the cart.
   * @returns {CartResponse}
   */
  async update(
    key: string,
    quantity: number
  ): Promise<ApiResult<CartResponse>> {
    const query = qs.stringify({ key, quantity }, { encode: true });

    const options: AxiosRequestConfig = {};
    this.addNonceHeader(options);
    this.addCartTokenHeader(options);

    const url = `${this.baseUrl}/${this.endpoint}/update-item?${query}`;
    const { data, error } = await this.doPost<CartResponse, unknown>(
      url,
      undefined,
      options
    );

    super.cartChanged(data);
    return { data, error };
  }

  /**
   * Remove Item
   * @param key
   * @returns {CartResponse}
   */
  async remove(key: string): Promise<ApiResult<CartResponse>> {
    const url = `${this.baseUrl}/${this.endpoint}/remove-item?key=${key}`;

    const options: AxiosRequestConfig = {};
    this.addNonceHeader(options);
    this.addCartTokenHeader(options);

    const { data, error } = await this.doPost<CartResponse, unknown>(
      url,
      undefined,
      options
    );

    super.cartChanged(data);
    return { data, error };
  }

  /**
   * Apply Coupon
   * @param code The coupon code you wish to apply to the cart.
   * @returns {CartResponse}
   */
  async applyCoupon(code: string): Promise<ApiResult<CartResponse>> {
    const url = `${this.baseUrl}/${this.endpoint}/apply-coupon/${code}`;

    const options: AxiosRequestConfig = {};
    this.addNonceHeader(options);
    this.addCartTokenHeader(options);

    const { data, error } = await this.doPost<CartResponse, unknown>(
      url,
      undefined,
      options
    );

    super.cartChanged(data);
    return { data, error };
  }

  /**
   * Remove Coupon
   * @param code The coupon code you wish to remove from the cart.
   * @returns {CartResponse}
   */
  async removeCoupon(code: string): Promise<ApiResult<CartResponse>> {
    const url = `${this.baseUrl}/${this.endpoint}/remove-coupon/${code}`;

    const options: AxiosRequestConfig = {};
    this.addNonceHeader(options);
    this.addCartTokenHeader(options);

    const { data, error } = await this.doPost<CartResponse, unknown>(
      url,
      undefined,
      options
    );

    super.cartChanged(data);
    return { data, error };
  }

  /**
   * Update Customer
   * @param body
   * @returns {CartResponse}
   */
  async updateCustomer(
    body: CartCustomerRequest
  ): Promise<ApiResult<CartResponse>> {
    const url = `${this.baseUrl}/${this.endpoint}/update-customer`;

    const options: AxiosRequestConfig = {};
    this.addNonceHeader(options);
    this.addCartTokenHeader(options);

    const { data, error } = await this.doPost<
      CartResponse,
      CartCustomerRequest
    >(url, body, options);

    super.cartChanged(data);
    return { data, error };
  }

  /**
   * Select Shipping Rate
   * @param packageId The ID of the shipping package within the cart.
   * @param rateId The chosen rate ID for the package.
   * @returns {CartResponse}s
   */
  async selectShippingRate(
    packageId: number,
    rateId: string
  ): Promise<ApiResult<CartResponse>> {
    const url = `${this.baseUrl}/${this.endpoint}/select-shipping-rate/package_id=${packageId}&rate_id=${rateId}`;

    const options: AxiosRequestConfig = {};
    this.addNonceHeader(options);
    this.addCartTokenHeader(options);

    const { data, error } = await this.doPost<CartResponse, unknown>(
      url,
      undefined,
      options
    );

    super.cartChanged(data);
    return { data, error };
  }
}
