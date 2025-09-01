import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addCartTokenInterceptors } from '../../interceptors/cart.token.interceptor.js';
import { addNonceInterceptors } from '../../interceptors/nonce.interceptor.js';
import { createHttpClient, httpClient } from '../../services/api.js';
import { EventBus } from '../../bus/event.bus.js';
import type { StoreSdkEvent } from '../../sdk.events.js';
import type { StoreSdkConfig } from '../../configs/sdk.config.js';

type AnyConfig = { headers: Record<string, unknown> };
interface InterceptorEntry<T> {
  fulfilled: (v: T) => Promise<T> | T;
}
interface InterceptorManager<T> {
  handlers: InterceptorEntry<T>[];
}
interface HttpWithInterceptors {
  interceptors: {
    request: InterceptorManager<AnyConfig>;
    response: InterceptorManager<{ headers: Record<string, unknown> }>;
  };
}
const castClient = () => httpClient as unknown as HttpWithInterceptors;

describe('Interceptors', () => {
  beforeEach(() => {
    // re-create http client fresh (module-level caching prevents duplicate, but fine)
    createHttpClient({ baseURL: 'https://api.test' });
  });

  it('cart token interceptor adds header, sets state, emits event', async () => {
    const state: Record<string, unknown> = {};
    const events = new EventBus<StoreSdkEvent>();
    const listener = vi.fn();
    events.on('cart:token:changed', listener);
    const setToken = vi.fn();
    const cfg = {
      baseUrl: '',
      cartToken: { getToken: async () => 'abc', setToken },
    } as unknown as StoreSdkConfig;
    addCartTokenInterceptors(cfg, state, events);

    // simulate request phase
    const reqHandler = castClient().interceptors.request.handlers[0];
    const config = await reqHandler.fulfilled({ headers: {} });
    expect(config.headers['cart-token']).toBe('abc');

    // simulate response phase with new token
    const resHandler = castClient().interceptors.response.handlers[0];
    const response = await resHandler.fulfilled({
      headers: { 'cart-token': 'xyz' },
    });
    expect(state.cartToken).toBe('xyz');
    expect(setToken).toHaveBeenCalledWith('xyz');
    expect(listener).toHaveBeenCalledWith('xyz');
    expect(response.headers['cart-token']).toBe('xyz');
  });

  it('cart token interceptor disabled path', async () => {
    const state: Record<string, unknown> = {};
    const events = new EventBus<StoreSdkEvent>();
    const cfg = {
      baseUrl: '',
      cartToken: { disabled: true },
    } as unknown as StoreSdkConfig;
    addCartTokenInterceptors(cfg, state, events);
    const handlers = castClient().interceptors.request.handlers;
    const reqHandler = handlers[handlers.length - 1];
    const config = await reqHandler.fulfilled({ headers: {} });
    expect(config.headers['cart-token']).toBeUndefined();
  });

  it('nonce interceptor adds header and emits event', async () => {
    const state: Record<string, unknown> = {};
    const events = new EventBus<StoreSdkEvent>();
    const listener = vi.fn();
    events.on('nonce:changed', listener);
    const setToken = vi.fn();
    const cfg = {
      baseUrl: '',
      nonce: { getToken: async () => 'nnn', setToken },
    } as unknown as StoreSdkConfig;
    addNonceInterceptors(cfg, state, events);
    const maybeReq = castClient().interceptors.request.handlers.find((h) =>
      h.fulfilled.toString().includes('nonce')
    );
    if (!maybeReq) throw new Error('request interceptor not found');
    const config = await maybeReq.fulfilled({ headers: {} });
    expect(config.headers['nonce']).toBe('nnn');
    const maybeRes = castClient().interceptors.response.handlers.find((h) =>
      h.fulfilled.toString().includes('nonce')
    );
    if (!maybeRes) throw new Error('response interceptor not found');
    await maybeRes.fulfilled({ headers: { nonce: 'mmm' } });
    expect(state.nonce).toBe('mmm');
    expect(setToken).toHaveBeenCalledWith('mmm');
    expect(listener).toHaveBeenCalledWith('mmm');
  });

  it('nonce interceptor disabled path', async () => {
    const state: Record<string, unknown> = {};
    const events = new EventBus<StoreSdkEvent>();
    const cfg = {
      baseUrl: '',
      nonce: { disabled: true },
    } as unknown as StoreSdkConfig;
    addNonceInterceptors(cfg, state, events);
    const handlers = castClient().interceptors.request.handlers;
    const reqHandler = handlers[handlers.length - 1];
    const config = await reqHandler.fulfilled({ headers: {} });
    expect(config.headers['nonce']).toBeUndefined();
  });
});
