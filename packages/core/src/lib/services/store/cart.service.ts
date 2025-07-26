import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { CartResponse } from '../../types/store/cart/cart.response.js';
import { CartItemAddRequest } from '../../types/store/cart-item/cart.item.add.request.js';
import { CartItemEditRequest } from '../../types/store/cart-item/cart.item.edit.request.js';
import { CartCustomerRequest } from '../../types/store/cart/cart.customer.request.js';
import qs from 'qs';

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
  get(): Promise<CartResponse> {
    const url = `${this.baseUrl}/${this.endpoint}`;
    return this.axiosInstance.get<unknown, CartResponse>(url);
  }

  /**
   * Add Item
   * @param params
   * @returns {CartResponse}
   */
  add(params: CartItemAddRequest): Promise<CartResponse> {
    const query = qs.stringify(params, { encode: true });
    const url = `${this.baseUrl}/${this.endpoint}/${query}`;
    return this.axiosInstance.post<CartItemAddRequest, CartResponse>(url);
  }

  /**
   * Update Item
   * @param params
   * @returns {CartResponse}
   */
  update(params: CartItemEditRequest): Promise<CartResponse> {
    const query = qs.stringify(params, { encode: true });
    const url = `${this.baseUrl}/${this.endpoint}/${query}`;
    return this.axiosInstance.post<CartItemEditRequest, CartResponse>(url);
  }

  /**
   * Remove Item
   * @param key
   * @returns {CartResponse}
   */
  remove(key: string): Promise<CartResponse> {
    const url = `${this.baseUrl}/${this.endpoint}/${key}`;
    return this.axiosInstance.post<string, CartResponse>(url);
  }

  /**
   * Apply Coupon
   * @param code The coupon code you wish to apply to the cart.
   * @returns {CartResponse}
   */
  applyCoupon(code: string): Promise<CartResponse> {
    const url = `${this.baseUrl}/${this.endpoint}/apply-coupon/${code}`;
    return this.axiosInstance.post<string, CartResponse>(url);
  }

  /**
   * Remove Coupon
   * @param code The coupon code you wish to remove from the cart.
   * @returns {CartResponse}
   */
  removeCoupon(code: string): Promise<CartResponse> {
    const url = `${this.baseUrl}/${this.endpoint}/remove-coupon/${code}`;
    return this.axiosInstance.post<string, CartResponse>(url);
  }

  /**
   * Update Customer
   * @param body
   * @returns {CartResponse}
   */
  updateCustomer(body: CartCustomerRequest): Promise<CartResponse> {
    const url = `${this.baseUrl}/${this.endpoint}/update-customer`;
    return this.axiosInstance.post<CartCustomerRequest, CartResponse>(
      url,
      body
    );
  }

  /**
   * Select Shipping Rate
   * @param packageId The ID of the shipping package within the cart.
   * @param rateId The chosen rate ID for the package.
   * @returns {CartResponse}s
   */
  selectShippingRate(packageId: number, rateId: string): Promise<CartResponse> {
    const url = `${this.baseUrl}/${this.endpoint}/select-shipping-rate/package_id=${packageId}&rate_id=${rateId}`;
    return this.axiosInstance.post<
      { packageId: number; rateId: string },
      CartResponse
    >(url);
  }
}
