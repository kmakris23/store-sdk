import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { CartCouponResponse } from '../../types/store/cart-coupon/cart.coupon.response.js';
import { doRequest } from '../../utilities/axios.utility.js';
import { ApiResult } from '../../types/api.js';

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
  async list(): Promise<ApiResult<CartCouponResponse[]>> {
    const url = `${this.baseUrl}/${this.endpoint}`;
    return await doRequest<CartCouponResponse[]>(this.axiosInstance, url, {
      method: 'get',
    });
  }

  /**
   * Get a single cart coupon.
   * @param code The coupon code of the cart coupon to retrieve.
   * @returns {CartCouponResponse}
   */
  async single(code: string): Promise<ApiResult<CartCouponResponse>> {
    const url = `${this.baseUrl}/${this.endpoint}/${code}`;
    return await doRequest<CartCouponResponse>(this.axiosInstance, url, {
      method: 'get',
    });
  }

  /**
   * Apply a coupon to the cart. Returns the new coupon object that was applied, or an error if it was not applied.
   * @param code The coupon code you wish to apply to the cart.
   * @returns {CartCouponResponse}
   */
  async add(code: string): Promise<ApiResult<CartCouponResponse>> {
    const url = `${this.baseUrl}/${this.endpoint}?code=${code}`;
    return await doRequest<CartCouponResponse>(this.axiosInstance, url, {
      method: 'post',
    });
  }

  /**
   * Delete/remove a coupon from the cart.
   * @param code The coupon code you wish to remove from the cart.
   * @returns {unknown}
   */
  async delete(code: string): Promise<ApiResult<unknown>> {
    const url = `${this.baseUrl}/${this.endpoint}/${code}`;
    return await doRequest<unknown>(this.axiosInstance, url, {
      method: 'delete',
    });
  }

  /**
   * Delete/remove all coupons from the cart.
   * @returns {CartCouponResponse[]}
   */
  async clear(): Promise<ApiResult<CartCouponResponse[]>> {
    const url = `${this.baseUrl}/${this.endpoint}`;
    return await doRequest<CartCouponResponse[]>(this.axiosInstance, url, {
      method: 'delete',
    });
  }
}
