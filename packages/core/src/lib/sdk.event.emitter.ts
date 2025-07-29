import { StoreSdkEvent } from './sdk.events.js';

export class StoreSdkEventEmitter {
  private handlers: {
    [K in keyof StoreSdkEvent]?: Set<(payload: StoreSdkEvent[K]) => void>;
  } = {};

  on<K extends keyof StoreSdkEvent>(
    event: K,
    handler: (payload: StoreSdkEvent[K]) => void
  ): void {
    if (!this.handlers[event]) {
      this.handlers[event] = new Set();
    }
    this.handlers[event]?.add(handler);
  }

  off<K extends keyof StoreSdkEvent>(
    event: K,
    handler: (payload: StoreSdkEvent[K]) => void
  ): void {
    this.handlers[event]?.delete(handler);
  }

  emit<K extends keyof StoreSdkEvent>(
    event: K,
    payload: StoreSdkEvent[K]
  ): void {
    this.handlers[event]?.forEach((handler) => handler(payload));
  }

  clear<K extends keyof StoreSdkEvent>(event: K): void {
    delete this.handlers[event];
  }
}
