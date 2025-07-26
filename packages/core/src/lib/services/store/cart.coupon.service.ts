import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { CartCouponResponse } from '../../types/store/cart-coupon/cart.coupon.response.js';

/**
 * Cart Coupons API
 */
export class CartCouponService {
  private readonly baseUrl: string;
  private readonly endpoint = 'wp-json/wc/store/v1/cart/coupons';
  private readonly axiosInstance: AxiosInstance;

  constructor(baseURL: string, config?: AxiosRequestConfig) {
    this.baseUrl = baseURL;
    this.axiosInstance = axios.create({
      baseURL,
      ...config,
    });
  }

  /**
   * List Cart Coupons
   * @returns {CartCouponResponse[]}
   */
  list(): Promise<CartCouponResponse[]> {
    const url = `${this.baseUrl}/${this.endpoint}`;
    return this.axiosInstance.get<unknown, CartCouponResponse[]>(url);
  }

  /**
   * Get a single cart coupon.
   * @param code The coupon code of the cart coupon to retrieve.
   * @returns {CartCouponResponse}
   */
  single(code: string): Promise<CartCouponResponse> {
    const url = `${this.baseUrl}/${this.endpoint}/${code}`;
    return this.axiosInstance.get<string, CartCouponResponse>(url);
  }

  /**
   * Apply a coupon to the cart. Returns the new coupon object that was applied, or an error if it was not applied.
   * @param code The coupon code you wish to apply to the cart.
   * @returns {CartCouponResponse}
   */
  add(code: string): Promise<CartCouponResponse> {
    const url = `${this.baseUrl}/${this.endpoint}?code=${code}`;
    return this.axiosInstance.post<string, CartCouponResponse>(url);
  }

  /**
   * Delete/remove a coupon from the cart.
   * @param code The coupon code you wish to remove from the cart.
   * @returns {unknown}
   */
  delete(code: string): Promise<unknown> {
    const url = `${this.baseUrl}/${this.endpoint}/${code}`;
    return this.axiosInstance.delete<string, unknown>(url);
  }

  /**
   * Delete/remove all coupons from the cart.
   * @returns {CartCouponResponse[]}
   */
  clear(): Promise<CartCouponResponse[]> {
    const url = `${this.baseUrl}/${this.endpoint}`;
    return this.axiosInstance.delete<string, CartCouponResponse[]>(url);
  }
}
