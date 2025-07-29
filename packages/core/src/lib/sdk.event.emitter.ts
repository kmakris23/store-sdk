import { StoreSdkEvent } from './sdk.events.js';

type Handler<T> = (payload?: T) => void;
export class StoreSdkEventEmitter<TEvents = StoreSdkEvent> {
  private listeners: {
    [K in keyof TEvents]?: Set<Handler<TEvents[K] >>;
  } = {};

  private onceListeners: {
    [K in keyof TEvents]?: Set<Handler<TEvents[K]>>;
  } = {};

  on<K extends keyof TEvents>(event: K, handler: Handler<TEvents[K]>): void {
    if (!this.listeners[event]) this.listeners[event] = new Set();
    this.listeners[event]?.add(handler);
  }

  once<K extends keyof TEvents>(event: K, handler: Handler<TEvents[K]>): void {
    if (!this.onceListeners[event]) this.onceListeners[event] = new Set();
    this.onceListeners[event]?.add(handler);
  }

  off<K extends keyof TEvents>(event: K, handler: Handler<TEvents[K]>): void {
    this.listeners[event]?.delete(handler);
    this.onceListeners[event]?.delete(handler);
  }

  emit<K extends keyof TEvents>(event: K, payload?: TEvents[K]): void {
    // Call persistent listeners
    this.listeners[event]?.forEach((handler) => {
      handler(payload);
    });

    // Call once listeners and then clear them
    const onceHandlers = this.onceListeners[event];
    if (onceHandlers) {
      onceHandlers.forEach((handler) => {
        handler(payload);
      });
      onceHandlers.clear();
    }
  }

  clear<K extends keyof TEvents>(event?: K): void {
    if (event) {
      this.listeners[event]?.clear();
      this.onceListeners[event]?.clear();
    } else {
      for (const key in this.listeners) {
        this.listeners[key as keyof TEvents]?.clear();
      }
      for (const key in this.onceListeners) {
        this.onceListeners[key as keyof TEvents]?.clear();
      }
    }
  }
}
