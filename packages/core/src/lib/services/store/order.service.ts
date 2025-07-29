import { OrderResponse } from '../../types/store/order/order.response.js';
import { ApiResult } from '../../types/api.js';
import { BaseService } from '../base.service.js';
import { AxiosRequestConfig } from 'axios';

/**
 * Order API
 *
 * The order API returns the pay-for-order order.
 */
export class OrderService extends BaseService {
  private readonly endpoint = 'wp-json/wc/store/v1/order';

  /**
   * Get Order
   * @param key
   * @param orderId
   * @param billingEmail
   * @returns {OrderResponse}
   */
  async get(
    key: string,
    orderId: string,
    billingEmail?: string
  ): Promise<ApiResult<OrderResponse>> {
    let url = `${this.baseUrl}/${this.endpoint}/${orderId}?key=${key}`;
    if (billingEmail) {
      url += `&billing_email=${billingEmail}`;
    }

    const options: AxiosRequestConfig = {};
    await this.addNonceHeader(options);
    await this.addCartTokenHeader(options);

    const { data, error } = await this.doGet<OrderResponse>(url, options);
    return { data, error };
  }
}
