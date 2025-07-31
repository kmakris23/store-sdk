import axios, { AxiosRequestConfig, CreateAxiosDefaults } from 'axios';
import { doRequest } from '../utilities/axios.utility.js';
import { StoreSdkConfig } from '../types/sdk.config.js';
import { StoreSdkState } from '../types/sdk.state.js';
import { StoreSdkEventEmitter } from '../sdk.event.emitter.js';
import { CartResponse } from '../types/store/index.js';

export class BaseService {
  protected NONCE_HEADER = 'nonce';
  protected CART_TOKEN_HEADER = 'cart-token';

  protected readonly state: StoreSdkState;
  protected readonly config: StoreSdkConfig;
  protected readonly events: StoreSdkEventEmitter;

  protected readonly baseUrl: string;

  constructor(
    state: StoreSdkState,
    config: StoreSdkConfig,
    events: StoreSdkEventEmitter
  ) {
    this.state = state;
    this.config = config;
    this.events = events;
    this.baseUrl = config.baseUrl;
  }

  protected createInstance(options: CreateAxiosDefaults = {}) {
    return axios.create({
      baseURL: this.config.baseUrl,
      ...options,
    });
  }

  protected async doGet<T>(url: string, options: AxiosRequestConfig = {}) {
    const axiosInstance = this.createInstance();
    return await doRequest<T>(axiosInstance, url, {
      ...options,
      method: 'get',
    });
  }
  protected async doPost<T, TData>(
    url: string,
    data?: TData,
    options: AxiosRequestConfig = {}
  ) {
    const axiosInstance = this.createInstance();
    return await doRequest<T>(axiosInstance, url, {
      ...options,
      method: 'post',
      data: data,
    });
  }
  protected async doPut<T, TData>(
    url: string,
    data?: TData,
    options: AxiosRequestConfig = {}
  ) {
    const axiosInstance = this.createInstance();
    return await doRequest<T>(axiosInstance, url, {
      ...options,
      method: 'put',
      data: data,
    });
  }
  protected async doDelete<T>(url: string, options: AxiosRequestConfig = {}) {
    const axiosInstance = this.createInstance();
    return await doRequest<T>(axiosInstance, url, {
      ...options,
      method: 'delete',
    });
  }

  protected async addNonceHeader(axiosRequestConfig: AxiosRequestConfig) {
    if (this.config.nonce?.disabled) return axiosRequestConfig;

    const nonce = this.config.nonce?.getToken
      ? await this.config.nonce?.getToken()
      : this.state.nonce;

    if (!nonce) return axiosRequestConfig;

    axiosRequestConfig.headers = {
      ...axiosRequestConfig.headers,
      ['Nonce']: nonce,
    };

    return axiosRequestConfig;
  }

  protected async addCartTokenHeader(axiosRequestConfig: AxiosRequestConfig) {
    if (this.config.cartToken?.disabled) return axiosRequestConfig;

    const cartToken = this.config.cartToken?.getToken
      ? await this.config.cartToken?.getToken()
      : this.state.cartToken;

    if (!cartToken) return axiosRequestConfig;

    axiosRequestConfig.headers = {
      ...axiosRequestConfig.headers,
      ['Cart-Token']: cartToken,
    };

    return axiosRequestConfig;
  }

  protected cartLoading(loading: boolean) {
    this.events.emit('cartLoading', loading);
  }
  protected cartChanged(newCart?: CartResponse) {
    const cartEqual =
      JSON.stringify(newCart) === JSON.stringify(this.state.cart);

    if (!cartEqual) {
      this.state.cart = newCart;
      this.events.emit('cartChanged', newCart);
    }
  }
  protected async nonceChanged(nonce?: string) {
    if (!nonce) return;

    const oldToken = this.config.nonce?.getToken
      ? await this.config.nonce?.getToken()
      : this.state.nonce;
    if (oldToken) return;

    this.state.nonce = nonce;
    if (this.config.nonce?.setToken) {
      await this.config.nonce?.setToken(nonce);
    }
    this.events.emit('nonceChanged', nonce);
  }
  protected async cartTokenChanged(cartToken?: string) {
    if (!cartToken) return;

    const oldToken = this.config.cartToken?.getToken
      ? await this.config.cartToken?.getToken()
      : this.state.cartToken;
    if (oldToken) return;

    this.state.cartToken = cartToken;
    if (this.config.cartToken?.setToken) {
      await this.config.cartToken?.setToken(cartToken);
    }
    this.events.emit('cartTokenChanged', cartToken);
  }
}
