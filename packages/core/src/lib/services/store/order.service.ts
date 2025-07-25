import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { OrderResponse } from '../../types/store/order/order.response';

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
  get(
    key: string,
    orderId: string,
    billingEmail?: string
  ): Promise<OrderResponse> {
    let url = `${this.baseUrl}/${this.endpoint}/${orderId}?key=${key}`;
    if (billingEmail) {
      url += `&billing_email=${billingEmail}`;
    }
    return this.axiosInstance.get<
      { key: string; order: string; billingEmail?: string },
      OrderResponse
    >(url);
  }
}
