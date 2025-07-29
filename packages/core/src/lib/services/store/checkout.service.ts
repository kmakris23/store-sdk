import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { CheckoutResponse } from '../../types/store/checkout/checkout.response.js';
import { CheckoutUpdateRequest } from '../../types/store/checkout/checkout.update.request.js';
import { CheckoutCreateRequest } from '../../types/store/checkout/checkout.create.request.js';
import { OrderRequest } from '../../types/store/order/order.request.js';
import qs from 'qs';
import { ApiResult } from '../../types/api.js';
import { doRequest } from '../../utilities/axios.utility.js';

/**
 * Checkout API
 */
export class CheckoutService {
  private readonly baseUrl: string;
  private readonly endpoint = 'wp-json/wc/store/v1/checkout';
  private readonly axiosInstance: AxiosInstance;

  constructor(baseURL: string, config?: AxiosRequestConfig) {
    this.baseUrl = baseURL;
    this.axiosInstance = axios.create({
      baseURL,
      ...config,
    });
  }

  /**
   * Get Checkout Data
   * @returns {CheckoutResponse}
   */
  async get(): Promise<ApiResult<CheckoutResponse>> {
    const url = `${this.baseUrl}/${this.endpoint}/`;
    const { data, error } = await doRequest<CheckoutResponse>(
      this.axiosInstance,
      url,
      {
        method: 'get',
      }
    );
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
    const url = `${this.baseUrl}/${this.endpoint}/?__experimental_calc_totals=${
      experimental_calc_totals || false
    }&${query}`;
    const { data, error } = await doRequest<CheckoutResponse>(
      this.axiosInstance,
      url,
      {
        method: 'put',
      }
    );
    return { data, error };
  }

  /**
   * Process Order and Payment
   * @param params
   * @returns {CheckoutResponse}
   */
  async create(
    params: CheckoutCreateRequest
  ): Promise<ApiResult<CheckoutResponse>> {
    const query = qs.stringify(params, { encode: true });
    const url = `${this.baseUrl}/${this.endpoint}/${query}`;
    const { data, error } = await doRequest<CheckoutResponse>(
      this.axiosInstance,
      url,
      {
        method: 'post',
      }
    );
    return { data, error };
  }

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
    const { data, error } = await doRequest<CheckoutResponse>(
      this.axiosInstance,
      url,
      {
        method: 'post',
        data: params,
      }
    );
    return { data, error };
  }
}
