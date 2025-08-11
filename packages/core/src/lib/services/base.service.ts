import { StoreSdkEventEmitter } from '../sdk.event.emitter.js';
import { CartResponse } from '../types/store/index.js';
import { StoreSdkState } from '../types/sdk.state.js';
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
  
  protected cartChanged(newCart?: CartResponse) {
    const cartEqual =
      JSON.stringify(newCart) === JSON.stringify(this.state.cart);

    if (!cartEqual) {
      this.state.cart = newCart;
      this.events.emit('cartChanged', newCart);
    }
  }
}
