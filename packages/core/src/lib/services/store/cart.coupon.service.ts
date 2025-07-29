import { CartCouponResponse } from '../../types/store/cart-coupon/cart.coupon.response.js';
import { ApiResult } from '../../types/api.js';
import { BaseService } from '../base.service.js';

/**
 * Cart Coupons API
 */
export class CartCouponService extends BaseService {
  private readonly endpoint = 'wp-json/wc/store/v1/cart/coupons';

  /**
   * List Cart Coupons
   * @returns {CartCouponResponse[]}
   */
  async list(): Promise<ApiResult<CartCouponResponse[]>> {
    const url = `${this.baseUrl}/${this.endpoint}`;
    const { data, error } = await this.doGet<CartCouponResponse[]>(url);
    return { data, error };
  }

  /**
   * Get a single cart coupon.
   * @param code The coupon code of the cart coupon to retrieve.
   * @returns {CartCouponResponse}
   */
  async single(code: string): Promise<ApiResult<CartCouponResponse>> {
    const url = `${this.baseUrl}/${this.endpoint}/${code}`;
    const { data, error } = await this.doGet<CartCouponResponse>(url);
    return { data, error };
  }

  /**
   * Apply a coupon to the cart. Returns the new coupon object that was applied, or an error if it was not applied.
   * @param code The coupon code you wish to apply to the cart.
   * @returns {CartCouponResponse}
   */
  async add(code: string): Promise<ApiResult<CartCouponResponse>> {
    const url = `${this.baseUrl}/${this.endpoint}?code=${code}`;
    const { data, error } = await this.doPost<CartCouponResponse, unknown>(url);
    return { data, error };
  }

  /**
   * Delete/remove a coupon from the cart.
   * @param code The coupon code you wish to remove from the cart.
   * @returns {unknown}
   */
  async delete(code: string): Promise<ApiResult<unknown>> {
    const url = `${this.baseUrl}/${this.endpoint}/${code}`;
    const { data, error } = await this.doDelete<unknown>(url);
    return { data, error };
  }

  /**
   * Delete/remove all coupons from the cart.
   * @returns {CartCouponResponse[]}
   */
  async clear(): Promise<ApiResult<CartCouponResponse[]>> {
    const url = `${this.baseUrl}/${this.endpoint}`;
    const { data, error } = await this.doDelete<CartCouponResponse[]>(url);
    return { data, error };
  }
}
