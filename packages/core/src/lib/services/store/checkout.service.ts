import { CheckoutResponse } from '../../types/store/checkout/checkout.response.js';
import { CheckoutUpdateRequest } from '../../types/store/checkout/checkout.update.request.js';
import { CheckoutCreateRequest } from '../../types/store/checkout/checkout.create.request.js';
import qs from 'qs';
import { ApiResult } from '../../types/api.js';
import { BaseService } from '../base.service.js';
import { AxiosRequestConfig } from 'axios';
import { doGet, doPut, doPost } from '../../utilities/axios.utility.js';

/**
 * Checkout API
 *
 * The checkout API facilitates the creation of orders (from the current cart) and handling payments for payment methods.
 */
export class CheckoutService extends BaseService {
  private readonly endpoint = 'wp-json/wc/store/v1/checkout';

  /**
   * Get Checkout Data
   * @returns {CheckoutResponse}
   */
  async get(): Promise<ApiResult<CheckoutResponse>> {
    const url = `/${this.endpoint}/`;

    const options: AxiosRequestConfig = {};
    await this.addNonceHeader(options);
    await this.addCartTokenHeader(options);

    const { data, error, headers } = await doGet<CheckoutResponse>(
      url,
      options
    );

    if (headers) {
      await super.nonceChanged(headers[this.NONCE_HEADER]);
    }

    return { data, error };
  }

  /**
   * Update checkout data
   * @param params
   * @param experimental_calc_totals This is used to determine if the cart totals should be recalculated. This should be set to true if the cart totals are being updated in response to a PUT request, false otherwise.
   * @returns {CheckoutResponse}
   */
  async update(
    params?: CheckoutUpdateRequest,
    experimental_calc_totals = false
  ): Promise<ApiResult<CheckoutResponse>> {
    const query = qs.stringify(params, { encode: true });

    const options: AxiosRequestConfig = {};
    await this.addNonceHeader(options);
    await this.addCartTokenHeader(options);

    const url = `/${this.endpoint}/?__experimental_calc_totals=${
      experimental_calc_totals || false
    }&${query}`;
    const { data, error, headers } = await doPut<CheckoutResponse, unknown>(
      url,
      undefined,
      options
    );

    if (headers) {
      await super.nonceChanged(headers[this.NONCE_HEADER]);
    }

    return { data, error };
  }

  /**
   * Process Order and Payment
   * @param params
   * @returns {CheckoutResponse}
   */
  async processOrderAndPayment(
    params: CheckoutCreateRequest
  ): Promise<ApiResult<CheckoutResponse>> {
    const query = qs.stringify(params, { encode: true });
    const url = `/${this.endpoint}/${query}`;

    const options: AxiosRequestConfig = {};
    await this.addNonceHeader(options);
    await this.addCartTokenHeader(options);

    const { data, error, headers } = await doPost<CheckoutResponse, unknown>(
      url,
      undefined,
      options
    );

    if (headers) {
      await super.nonceChanged(headers[this.NONCE_HEADER]);
    }

    return { data, error };
  }
}
