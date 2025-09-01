import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
  type MockedFunction,
} from 'vitest';
import { CartService } from '../../../services/store/cart.service.js';
import { StoreSdkConfig } from '../../../configs/sdk.config.js';
import { StoreSdkState } from '../../../types/sdk.state.js';
import {
  CartResponse,
  CartItemAddRequest,
  CartCustomerRequest,
} from '../../../types/store/index.js';
import { EventBus } from '../../../bus/event.bus.js';
import { StoreSdkEvent } from '../../../sdk.events.js';
import { ApiError } from '../../../types/api.js';

vi.mock('../../../utilities/axios.utility.js', () => ({
  doGet: vi.fn(),
  doPost: vi.fn(),
}));
import { doGet, doPost } from '../../../utilities/axios.utility.js';

describe('CartService', () => {
  let service: CartService;
  let mockedGet: MockedFunction<typeof doGet>;
  let mockedPost: MockedFunction<typeof doPost>;
  const state: StoreSdkState = {};
  const config: StoreSdkConfig = { baseUrl: 'https://example.com' };
  const events = new EventBus<StoreSdkEvent>();

  const cart = (count: number): CartResponse =>
    ({ items_count: count } as unknown as CartResponse);

  const collectEvents = () => {
    const received: { event: keyof StoreSdkEvent; payload?: unknown }[] = [];
    events.onAny((ev, payload) => {
      const key = ev as keyof StoreSdkEvent;
      if (
        key === 'cart:loading' ||
        key === 'cart:request:start' ||
        key === 'cart:request:success' ||
        key === 'cart:request:error' ||
        key === 'cart:updated'
      ) {
        received.push({ event: key, payload });
      }
    });
    return received;
  };

  beforeEach(() => {
    mockedGet = doGet as unknown as MockedFunction<typeof doGet>;
    mockedPost = doPost as unknown as MockedFunction<typeof doPost>;
    vi.clearAllMocks();
    service = new CartService(state, config, events);
  });

  it('gets cart and emits events', async () => {
    mockedGet.mockResolvedValue({ data: cart(2) });
    const eventsArr = collectEvents();
    const result = await service.get();
    expect(mockedGet).toHaveBeenCalledWith(
      '/wp-json/wc/store/v1/cart',
      expect.any(Object)
    );
    expect(result.data?.items_count).toBe(2);
    const names = eventsArr.map((e) => e.event);
    expect(names).toContain('cart:loading');
    expect(names).toContain('cart:updated');
  });

  it('adds item and emits sequence', async () => {
    mockedPost.mockResolvedValue({ data: cart(1) });
    const eventsArr = collectEvents();
    await service.add({ id: 10, quantity: 2 } as CartItemAddRequest);
    const url = mockedPost.mock.calls[0][0];
    expect(url).toContain('/wp-json/wc/store/v1/cart/add-item?');
    const names = eventsArr.map((e) => e.event);
    expect(names[0]).toBe('cart:loading');
    expect(names).toContain('cart:request:success');
  });

  it('updates item', async () => {
    mockedPost.mockResolvedValue({ data: cart(1) });
    await service.update('itemKey', 3);
    expect(mockedPost.mock.calls[0][0]).toContain(
      '/wp-json/wc/store/v1/cart/update-item?'
    );
  });

  it('removes item', async () => {
    mockedPost.mockResolvedValue({ data: cart(0) });
    await service.remove('itemKey');
    expect(mockedPost.mock.calls[0][0]).toContain(
      '/wp-json/wc/store/v1/cart/remove-item?key=itemKey'
    );
  });

  it('applies coupon', async () => {
    mockedPost.mockResolvedValue({ data: cart(1) });
    await service.applyCoupon('SAVE20');
    expect(mockedPost.mock.calls[0][0]).toBe(
      '/wp-json/wc/store/v1/cart/apply-coupon?code=SAVE20'
    );
  });

  it('removes coupon', async () => {
    mockedPost.mockResolvedValue({ data: cart(1) });
    await service.removeCoupon('SAVE20');
    expect(mockedPost.mock.calls[0][0]).toBe(
      '/wp-json/wc/store/v1/cart/remove-coupon?code=SAVE20'
    );
  });

  it('updates customer', async () => {
    mockedPost.mockResolvedValue({ data: cart(1) });
    const body: CartCustomerRequest = {
      billing_address: {
        address_1: 'a',
        address_2: '',
        city: '',
        company: '',
        country: '',
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
        postcode: '',
        state: '',
      },
      shipping_address: {
        address_1: '',
        address_2: '',
        city: '',
        company: '',
        country: '',
        first_name: '',
        last_name: '',
        phone: '',
        postcode: '',
        state: '',
      },
    };
    await service.updateCustomer(body);
    expect(mockedPost.mock.calls[0][0]).toBe(
      '/wp-json/wc/store/v1/cart/update-customer'
    );
  });

  it('selects shipping rate', async () => {
    mockedPost.mockResolvedValue({ data: cart(1) });
    await service.selectShippingRate(5, 'flat_rate');
    expect(mockedPost.mock.calls[0][0]).toBe(
      '/wp-json/wc/store/v1/cart/select-shipping-rate/package_id=5&rate_id=flat_rate'
    );
  });

  it('handles error and emits error event', async () => {
    const error: ApiError = {
      code: 'err',
      message: 'fail',
      data: { status: 500 },
      details: {},
    };
    mockedGet.mockResolvedValue({ error });
    const eventsArr = collectEvents();
    const result = await service.get();
    expect(result.error).toEqual(error);
    expect(eventsArr.map((e) => e.event)).toContain('cart:request:error');
  });
});
