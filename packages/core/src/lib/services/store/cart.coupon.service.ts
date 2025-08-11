import { CartCouponResponse } from '../../types/store/cart-coupon/cart.coupon.response.js';
import { ApiPaginationResult, ApiResult } from '../../types/api.js';
import { BaseService } from '../base.service.js';
import { doDelete, doGet, doPost } from '../../utilities/axios.utility.js';
import { parseLinkHeader } from '../../utilities/common.js';

/**
 * Cart Coupons API
 */
export class CartCouponService extends BaseService {
  private readonly endpoint = 'wp-json/wc/store/v1/cart/coupons';

  /**
   * List Cart Coupons
   * @returns {CartCouponResponse[]}
   */
  async list(): Promise<ApiPaginationResult<CartCouponResponse[]>> {
    const url = `/${this.endpoint}`;
    const { data, error, headers } = await doGet<CartCouponResponse[]>(url);

    let total, totalPages, link;
    if (headers) {
      link = parseLinkHeader(headers['link']);
      total = headers['x-wp-total'];
      totalPages = headers['x-wp-totalpages'];
    }

    return { data, error, total: total, totalPages, link };
  }

  /**
   * Get a single cart coupon.
   * @param code The coupon code of the cart coupon to retrieve.
   * @returns {CartCouponResponse}
   */
  async single(code: string): Promise<ApiResult<CartCouponResponse>> {
    const url = `/${this.endpoint}/${code}`;
    const { data, error } = await doGet<CartCouponResponse>(url);

    return { data, error };
  }

  /**
   * Apply a coupon to the cart. Returns the new coupon object that was applied, or an error if it was not applied.
   * @param code The coupon code you wish to apply to the cart.
   * @returns {CartCouponResponse}
   */
  async add(code: string): Promise<ApiResult<CartCouponResponse>> {
    const url = `/${this.endpoint}?code=${code}`;
    const { data, error } = await doPost<CartCouponResponse, unknown>(url);

    return { data, error };
  }

  /**
   * Delete/remove a coupon from the cart.
   * @param code The coupon code you wish to remove from the cart.
   * @returns {unknown}
   */
  async delete(code: string): Promise<ApiResult<unknown>> {
    const url = `/${this.endpoint}/${code}`;
    const { data, error } = await doDelete<unknown>(url);

    return { data, error };
  }

  /**
   * Delete/remove all coupons from the cart.
   * @returns {CartCouponResponse[]}
   */
  async clear(): Promise<ApiResult<CartCouponResponse[]>> {
    const url = `/${this.endpoint}`;
    const { data, error } = await doDelete<CartCouponResponse[]>(url);

    return { data, error };
  }
}
