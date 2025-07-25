import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { CheckoutResponse } from '../../types/store/checkout/checkout.response';
import { CheckoutUpdateRequest } from '../../types/store/checkout/checkout.update.request';
import { CheckoutCreateRequest } from '../../types/store/checkout/checkout.create.request';
import { OrderRequest } from '../../types/store/order/order.request';
import qs from 'qs';

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
  get(): Promise<CheckoutResponse> {
    const url = `${this.baseUrl}/${this.endpoint}/`;
    return this.axiosInstance.get<{}, CheckoutResponse>(url);
  }

  /**
   * Update checkout data
   * @param params
   * @param experimental_calc_totals This is used to determine if the cart totals should be recalculated. This should be set to true if the cart totals are being updated in response to a PUT request, false otherwise.
   * @returns {CheckoutResponse}
   */
  update(
    params?: CheckoutUpdateRequest,
    experimental_calc_totals = false
  ): Promise<CheckoutResponse> {
    const query = qs.stringify(params, { encode: true });
    const url = `${this.baseUrl}/${this.endpoint}/?__experimental_calc_totals=${
      experimental_calc_totals || false
    }&${query}`;
    return this.axiosInstance.put<CheckoutUpdateRequest, CheckoutResponse>(url);
  }

  /**
   * Process Order and Payment
   * @param params
   * @returns {CheckoutResponse}
   */
  create(params: CheckoutCreateRequest): Promise<CheckoutResponse> {
    const query = qs.stringify(params, { encode: true });
    const url = `${this.baseUrl}/${this.endpoint}/${query}`;
    return this.axiosInstance.post<CheckoutCreateRequest, CheckoutResponse>(
      url
    );
  }

  /**
   * Process Order and Payment
   * @param orderId
   * @param params
   * @returns
   */
  order(orderId: number, params: OrderRequest): Promise<CheckoutResponse> {
    const url = `${this.baseUrl}/${this.endpoint}/${orderId}`;
    return this.axiosInstance.post<OrderRequest, CheckoutResponse>(url, params);
  }
}
