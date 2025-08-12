import { StoreSdkEvent } from '../sdk.events.js';

type EventMap = StoreSdkEvent;

type Handler<P> = (payload: P) => void | Promise<void>;
type AnyHandler<E extends EventMap> = <K extends keyof E>(
  event: K,
  payload: E[K]
) => void;

export type Middleware<E extends EventMap> = <K extends keyof E>(
  ctx: { event: K; payload: E[K] },
  next: () => void
) => void;

type OptionalPayloadEvents<E extends EventMap> = {
  [K in keyof E]: E[K] extends void | undefined ? K : never;
}[keyof E];

interface Shared<E extends EventMap> {
  listeners: { [K in keyof E]?: Set<Handler<E[K]>> };
  anyListeners: Set<AnyHandler<E>>;
  middleware: Middleware<E>[];
}

export class EventBus<E extends EventMap> {
  private shared: Shared<E>;
  private prefix: string;

  constructor(prefix = '', shared?: Shared<E>) {
    this.prefix = prefix;
    this.shared = shared ?? {
      listeners: {},
      anyListeners: new Set(),
      middleware: [],
    };
  }

  on<K extends keyof E>(event: K, handler: Handler<E[K]>): () => void {
    const key = this.key(event);
    (this.shared.listeners[key] ??= new Set()).add(handler);
    return () => this.off(event, handler);
  }

  once<K extends keyof E>(event: K, handler: Handler<E[K]>): () => void {
    const off = this.on(event, (p) => {
      off();
      handler(p);
    });
    return off;
  }

  off<K extends keyof E>(event: K, handler: Handler<E[K]>): void {
    this.shared.listeners[this.key(event)]?.delete(handler);
  }

  // --- emit overloads: require payload unless payload is void/undefined
  emit<K extends Exclude<keyof E, OptionalPayloadEvents<E>>>(
    event: K,
    payload: E[K]
  ): void;
  emit<K extends OptionalPayloadEvents<E>>(event: K): void;
  emit<K extends keyof E>(event: K, payload?: E[K]): void {
    const key = this.key(event);

    let i = -1;
    const run = () => {
      i++;
      const mw: Middleware<E> | undefined = this.shared.middleware[i];
      if (mw) {
        mw({ event: key, payload: payload as E[K] }, run);
        return;
      }

      const set = this.shared.listeners[key] as Set<Handler<E[K]>> | undefined;

      set?.forEach((h) => h(payload as E[K]));
      this.shared.anyListeners.forEach((h) => h(key, payload as E[K]));
    };

    run();
  }

  // --- emitIf with the same overload behavior
  emitIf<K extends Exclude<keyof E, OptionalPayloadEvents<E>>>(
    condition: boolean,
    event: K,
    payload: E[K]
  ): boolean;
  emitIf<K extends OptionalPayloadEvents<E>>(
    condition: boolean,
    event: K
  ): boolean;
  emitIf<K extends keyof E>(
    condition: boolean,
    event: K,
    payload?: E[K]
  ): boolean {
    if (!condition) return false;
    (this.emit as (e: K, p?: E[K]) => void)(event, payload);
    return true;
  }

  waitFor<K extends keyof E>(
    event: K,
    predicate?: (p: E[K]) => boolean,
    timeoutMs?: number
  ): Promise<E[K]> {
    return new Promise<E[K]>((resolve, reject) => {
      const off = this.on(event, (p) => {
        if (!predicate || predicate(p)) {
          off();
          if (tid) clearTimeout(tid);
          resolve(p);
        }
      });
      let tid: ReturnType<typeof setTimeout> | undefined;
      if (timeoutMs != null) {
        tid = setTimeout(() => {
          off();
          reject(new Error(`waitFor timeout: ${String(this.key(event))}`));
        }, timeoutMs);
      }
    });
  }

  onAny(handler: AnyHandler<E>): () => void {
    this.shared.anyListeners.add(handler);
    return () => this.shared.anyListeners.delete(handler);
  }

  use(mw: Middleware<E>): () => void {
    this.shared.middleware.push(mw);
    return () => {
      const i = this.shared.middleware.indexOf(mw);
      if (i >= 0) this.shared.middleware.splice(i, 1);
    };
  }

  scope(prefix: string): EventBus<E> {
    return new EventBus<E>(this.prefix + prefix, this.shared);
  }

  clear(): void {
    this.shared.listeners = {};
    this.shared.anyListeners.clear();
    this.shared.middleware.length = 0;
  }

  private key<K extends keyof E>(event: K): K {
    return (this.prefix ? this.prefix + String(event) : String(event)) as K;
  }
}
