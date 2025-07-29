import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { CartResponse } from '../../types/store/cart/cart.response.js';
import { CartItemAddRequest } from '../../types/store/cart-item/cart.item.add.request.js';
import { CartItemEditRequest } from '../../types/store/cart-item/cart.item.edit.request.js';
import { CartCustomerRequest } from '../../types/store/cart/cart.customer.request.js';
import qs from 'qs';
import { ApiResult } from '../../types/api.js';
import { doRequest } from '../../utilities/axios.utility.js';
import { StoreSdkEventEmitter } from '../../sdk.event.emitter.js';
import { StoreSdkConfig } from '../../types/sdk.config.js';
import { StoreSdkState } from '../../types/sdk.state.js';
/**
 * Cart API
 */
export class CartService {
  private readonly events = new StoreSdkEventEmitter();
  private readonly baseUrl: string;
  private readonly config: StoreSdkConfig;
  private readonly endpoint = 'wp-json/wc/store/v1/cart';
  private readonly axiosInstance: AxiosInstance;

  constructor(
    events: StoreSdkEventEmitter,
    sdkConfig: StoreSdkConfig,
    sdkState: StoreSdkState,
    config?: AxiosRequestConfig
  ) {
    this.config = sdkConfig;
    this.events = events;
    this.baseUrl = sdkConfig.baseUrl;
    this.axiosInstance = axios.create({
      baseURL: sdkConfig.baseUrl,
      ...config,
    });

    this.axiosInstance.interceptors.request.use(async (requestConfig) => {
      const cartToken = this.config.cartTokenResolver
        ? await this.config.cartTokenResolver()
        : sdkState.cartToken;

      if (cartToken) {
        requestConfig.headers.set('Cart-Token', cartToken);
      }

      const nonce = this.config.nonceResolver
        ? await this.config.nonceResolver()
        : sdkState.nonce;

      if (nonce) {
        requestConfig.headers.set('Nonce', nonce);
      }

      return requestConfig;
    });
  }

  /**
   * Get Cart
   * @returns {CartResponse}
   */
  async get(): Promise<ApiResult<CartResponse>> {
    const url = `${this.baseUrl}/${this.endpoint}`;

    const { data, error, headers } = await doRequest<CartResponse>(
      this.axiosInstance,
      url,
      {
        method: 'get',
      }
    );

    if (headers && headers['nonce']) {
      this.events.emit('nonceChanged', headers['nonce']);
    }
    if (headers && headers['cart-token']) {
      this.events.emit('cartTokenChanged', headers['cart-token']);
    }
    return { data, error };
  }

  /**
   * Add Item
   * @param params
   * @returns {CartResponse}
   */
  async add(params: CartItemAddRequest): Promise<ApiResult<CartResponse>> {
    const query = qs.stringify(params, { encode: true });
    const url = `${this.baseUrl}/${this.endpoint}/add-item?${query}`;
    const { data, error } = await doRequest<CartResponse>(
      this.axiosInstance,
      url,
      {
        method: 'post',
      }
    );
    return { data, error };
  }

  /**
   * Update Item
   * @param params
   * @returns {CartResponse}
   */
  async update(params: CartItemEditRequest): Promise<ApiResult<CartResponse>> {
    const query = qs.stringify(params, { encode: true });
    const url = `${this.baseUrl}/${this.endpoint}/update-item?${query}`;
    const { data, error } = await doRequest<CartResponse>(
      this.axiosInstance,
      url,
      {
        method: 'post',
      }
    );
    return { data, error };
  }

  /**
   * Remove Item
   * @param key
   * @returns {CartResponse}
   */
  async remove(key: string): Promise<ApiResult<CartResponse>> {
    const url = `${this.baseUrl}/${this.endpoint}/remove-item?key=${key}`;
    const { data, error } = await doRequest<CartResponse>(
      this.axiosInstance,
      url,
      {
        method: 'post',
      }
    );
    return { data, error };
  }

  /**
   * Apply Coupon
   * @param code The coupon code you wish to apply to the cart.
   * @returns {CartResponse}
   */
  async applyCoupon(code: string): Promise<ApiResult<CartResponse>> {
    const url = `${this.baseUrl}/${this.endpoint}/apply-coupon/${code}`;
    const { data, error } = await doRequest<CartResponse>(
      this.axiosInstance,
      url,
      {
        method: 'post',
      }
    );
    return { data, error };
  }

  /**
   * Remove Coupon
   * @param code The coupon code you wish to remove from the cart.
   * @returns {CartResponse}
   */
  async removeCoupon(code: string): Promise<ApiResult<CartResponse>> {
    const url = `${this.baseUrl}/${this.endpoint}/remove-coupon/${code}`;
    const { data, error } = await doRequest<CartResponse>(
      this.axiosInstance,
      url,
      {
        method: 'post',
      }
    );
    return { data, error };
  }

  /**
   * Update Customer
   * @param body
   * @returns {CartResponse}
   */
  async updateCustomer(
    body: CartCustomerRequest
  ): Promise<ApiResult<CartResponse>> {
    const url = `${this.baseUrl}/${this.endpoint}/update-customer`;
    const { data, error } = await doRequest<CartResponse>(
      this.axiosInstance,
      url,
      {
        method: 'post',
        data: body,
      }
    );
    return { data, error };
  }

  /**
   * Select Shipping Rate
   * @param packageId The ID of the shipping package within the cart.
   * @param rateId The chosen rate ID for the package.
   * @returns {CartResponse}s
   */
  async selectShippingRate(
    packageId: number,
    rateId: string
  ): Promise<ApiResult<CartResponse>> {
    const url = `${this.baseUrl}/${this.endpoint}/select-shipping-rate/package_id=${packageId}&rate_id=${rateId}`;
    const { data, error } = await doRequest<CartResponse>(
      this.axiosInstance,
      url,
      {
        method: 'post',
      }
    );
    return { data, error };
  }
}
