import { StoreSdkState } from '../types/sdk.state.js';
import { StoreSdkConfig } from '../configs/sdk.config.js';
import { EventBus } from '../bus/event.bus.js';
import { StoreSdkEvent } from '../sdk.events.js';

export class BaseService {
  protected NONCE_HEADER = 'nonce';
  protected CART_TOKEN_HEADER = 'cart-token';

  protected readonly state: StoreSdkState;
  protected readonly config: StoreSdkConfig;
  protected readonly events: EventBus<StoreSdkEvent>;

  constructor(
    state: StoreSdkState,
    config: StoreSdkConfig,
    events: EventBus<StoreSdkEvent>
  ) {
    this.state = state;
    this.events = events;
    this.config = config;
  }
}
