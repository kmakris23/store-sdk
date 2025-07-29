import { AxiosRequestConfig } from 'axios';
import { ApiResult } from '../../types/api.js';
import { CheckoutResponse, OrderRequest } from '../../types/store/index.js';
import { BaseService } from '../base.service.js';

/**
 * Checkout order API
 *
 * The checkout order API facilitates the processing of existing orders and handling payments.
 */
export class CheckoutOrderService extends BaseService {
  private readonly endpoint = 'wp-json/wc/store/v1/checkout';

  /**
   * Process Order and Payment
   * @param orderId
   * @param params
   * @returns
   */
  async order(
    orderId: number,
    params: OrderRequest
  ): Promise<ApiResult<CheckoutResponse>> {
    const url = `${this.baseUrl}/${this.endpoint}/${orderId}`;

    const options: AxiosRequestConfig = {};
    await this.addNonceHeader(options);
    await this.addCartTokenHeader(options);

    const { data, error } = await this.doPost<CheckoutResponse, OrderRequest>(
      url,
      params,
      options
    );
    return { data, error };
  }
}
