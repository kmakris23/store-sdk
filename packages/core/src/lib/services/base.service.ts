import { StoreSdkEventEmitter } from '../sdk.event.emitter.js';
import { CartResponse } from '../types/store/index.js';
import { StoreSdkState } from '../types/sdk.state.js';
import { AxiosRequestConfig } from 'axios';
import { StoreSdkConfig } from '../types/sdk.config.js';

export class BaseService {
  protected NONCE_HEADER = 'nonce';
  protected CART_TOKEN_HEADER = 'cart-token';

  protected readonly state: StoreSdkState;
  protected readonly config: StoreSdkConfig;
  protected readonly events: StoreSdkEventEmitter;

  constructor(
    state: StoreSdkState,
    config: StoreSdkConfig,
    events: StoreSdkEventEmitter
  ) {
    this.state = state;
    this.events = events;
    this.config = config;
  }

  protected async addNonceHeader(axiosRequestConfig: AxiosRequestConfig) {
    if (this.config.nonce?.disabled) return axiosRequestConfig;

    const nonce = this.config.nonce?.getToken
      ? await this.config.nonce?.getToken()
      : this.state.nonce;

    if (!nonce) return axiosRequestConfig;

    axiosRequestConfig.headers = {
      ...axiosRequestConfig.headers,
      [this.NONCE_HEADER]: nonce,
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
      [this.CART_TOKEN_HEADER]: cartToken,
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
