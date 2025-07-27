import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { CartResponse } from '../../types/store/cart/cart.response.js';
import { CartItemAddRequest } from '../../types/store/cart-item/cart.item.add.request.js';
import { CartItemEditRequest } from '../../types/store/cart-item/cart.item.edit.request.js';
import { CartCustomerRequest } from '../../types/store/cart/cart.customer.request.js';
import qs from 'qs';
import { ApiResult } from '../../types/api.js';
import { doRequest } from '../../utilities/axios.utility.js';

/**
 * Cart API
 */
export class CartService {
  private readonly baseUrl: string;
  private readonly endpoint = 'wp-json/wc/store/v1/cart';
  private readonly axiosInstance: AxiosInstance;

  constructor(baseURL: string, config?: AxiosRequestConfig) {
    this.baseUrl = baseURL;
    this.axiosInstance = axios.create({
      baseURL,
      ...config,
    });
  }

  /**
   * Get Cart
   * @returns {CartResponse}
   */
  async get(): Promise<ApiResult<CartResponse>> {
    const url = `${this.baseUrl}/${this.endpoint}`;
    return await doRequest<CartResponse>(this.axiosInstance, url);
  }

  /**
   * Add Item
   * @param params
   * @returns {CartResponse}
   */
  async add(params: CartItemAddRequest): Promise<ApiResult<CartResponse>> {
    const query = qs.stringify(params, { encode: true });
    const url = `${this.baseUrl}/${this.endpoint}/add-item?${query}`;
    return await doRequest<CartResponse>(this.axiosInstance, url);
  }

  /**
   * Update Item
   * @param params
   * @returns {CartResponse}
   */
  async update(params: CartItemEditRequest): Promise<ApiResult<CartResponse>> {
    const query = qs.stringify(params, { encode: true });
    const url = `${this.baseUrl}/${this.endpoint}/update-item?${query}`;
    return await doRequest<CartResponse>(this.axiosInstance, url);
  }

  /**
   * Remove Item
   * @param key
   * @returns {CartResponse}
   */
  async remove(key: string): Promise<ApiResult<CartResponse>> {
    const url = `${this.baseUrl}/${this.endpoint}/remove-item?key=${key}`;
    return await doRequest<CartResponse>(this.axiosInstance, url);
  }

  /**
   * Apply Coupon
   * @param code The coupon code you wish to apply to the cart.
   * @returns {CartResponse}
   */
  async applyCoupon(code: string): Promise<ApiResult<CartResponse>> {
    const url = `${this.baseUrl}/${this.endpoint}/apply-coupon/${code}`;
    return await doRequest<CartResponse>(this.axiosInstance, url);
  }

  /**
   * Remove Coupon
   * @param code The coupon code you wish to remove from the cart.
   * @returns {CartResponse}
   */
  async removeCoupon(code: string): Promise<ApiResult<CartResponse>> {
    const url = `${this.baseUrl}/${this.endpoint}/remove-coupon/${code}`;
    return await doRequest<CartResponse>(this.axiosInstance, url);
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
    return await doRequest<CartResponse>(this.axiosInstance, url);
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
    return await doRequest<CartResponse>(this.axiosInstance, url);
  }
}
