import { describe, it, expect, beforeEach } from 'vitest';
import { StoreService } from '../../../services/store.service.js';
import { EventBus } from '../../../bus/event.bus.js';
import { StoreSdkEvent } from '../../../sdk.events.js';
import { StoreSdkConfig } from '../../../configs/sdk.config.js';
import { StoreSdkState } from '../../../types/sdk.state.js';

describe('StoreService (composition)', () => {
  let store: StoreService;
  let state: StoreSdkState;
  let config: StoreSdkConfig;
  let events: EventBus<StoreSdkEvent>;

  beforeEach(() => {
    state = {};
    config = { baseUrl: 'https://example.com' };
    events = new EventBus<StoreSdkEvent>();
    store = new StoreService(state, config, events);
  });

  it('exposes all expected service getters', () => {
    // Sanity: all getters return objects exposing an endpoint field (private in class) or are defined.
    expect(typeof store.products).toBe('object');
    expect(typeof store.categories).toBe('object');
    expect(typeof store.tags).toBe('object');
    expect(typeof store.brands).toBe('object');
    expect(typeof store.attributes).toBe('object');
    expect(typeof store.attributesTerms).toBe('object');
    expect(typeof store.reviews).toBe('object');
    expect(typeof store.collectionData).toBe('object');
    expect(typeof store.cart).toBe('object');
    expect(typeof store.cartItems).toBe('object');
    expect(typeof store.cartCoupons).toBe('object');
    expect(typeof store.orders).toBe('object');
    expect(typeof store.checkout).toBe('object');
  });

  it('returns the same reference for repeated getter access (singleton per sub-service)', () => {
    expect(store.products).toBe(store.products);
    expect(store.categories).toBe(store.categories);
    expect(store.cart).toBe(store.cart);
    expect(store.checkout).toBe(store.checkout);
  });

  it('does not mutate provided state object reference', () => {
    // Add a marker property and ensure it remains untouched after getter access
    (state as Record<string, unknown>).marker = 123;
    void store.products; // trigger initialization
    expect((state as Record<string, unknown>).marker).toBe(123);
  });
});
