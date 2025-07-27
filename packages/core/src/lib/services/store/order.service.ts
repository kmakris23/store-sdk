import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { OrderResponse } from '../../types/store/order/order.response.js';
import { ApiResult } from '../../types/api.js';
import { doRequest } from '../../utilities/axios.utility.js';

/**
 * Order API
 */
export class OrderService {
  private readonly baseUrl: string;
  private readonly endpoint = 'wp-json/wc/store/v1/order';
  private readonly axiosInstance: AxiosInstance;

  constructor(baseURL: string, config?: AxiosRequestConfig) {
    this.baseUrl = baseURL;
    this.axiosInstance = axios.create({
      baseURL,
      ...config,
    });
  }

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
    return await doRequest<OrderResponse>(this.axiosInstance, url);
  }
}
