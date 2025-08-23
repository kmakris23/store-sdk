import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
  afterEach,
  type MockedFunction,
} from 'vitest';
import { CartCouponService } from '../../../services/store/cart.coupon.service.js';
import { CartCouponResponse } from '../../../types/store/index.js';
import { StoreSdkConfig } from '../../../configs/sdk.config.js';
import { StoreSdkState } from '../../../types/sdk.state.js';
import { EventBus } from '../../../bus/event.bus.js';
import { StoreSdkEvent } from '../../../sdk.events.js';
import { ApiError } from '../../../types/api.js';

vi.mock('../../../utilities/axios.utility.js', () => ({
  doGet: vi.fn(),
  doPost: vi.fn(),
  doDelete: vi.fn(),
}));

import { doGet, doPost, doDelete } from '../../../utilities/axios.utility.js';

describe('CartCouponService', () => {
  let service: CartCouponService;
  const state: StoreSdkState = {};
  const config: StoreSdkConfig = { baseUrl: 'https://example.com' };
  let events: EventBus<StoreSdkEvent>;
  let mockedGet: MockedFunction<typeof doGet>;
  let mockedPost: MockedFunction<typeof doPost>;
  let mockedDelete: MockedFunction<typeof doDelete>;

  const coupon = (code: string): CartCouponResponse => ({
    code,
    type: 'fixed_cart',
    totals: {
      currency_code: 'USD',
      currency_symbol: '$',
      currency_minor_unit: 2,
      currency_decimal_separator: '.',
      currency_thousand_separator: ',',
      currency_prefix: '$',
      currency_suffix: '',
      total_discount: '100',
      total_discount_tax: '0',
    },
  });

  beforeEach(() => {
    events = new EventBus<StoreSdkEvent>();
    service = new CartCouponService(state, config, events);
    mockedGet = doGet as unknown as MockedFunction<typeof doGet>;
    mockedPost = doPost as unknown as MockedFunction<typeof doPost>;
    mockedDelete = doDelete as unknown as MockedFunction<typeof doDelete>;
    vi.clearAllMocks();
  });
  afterEach(() => vi.clearAllMocks());

  it('list() parses pagination headers and link header', async () => {
    const data = [coupon('SAVE10'), coupon('SAVE15')];
    const linkHeader =
      '<https://example.com/wp-json/wc/store/v1/cart/coupons?page=2>; rel="next"';
    mockedGet.mockResolvedValue({
      data,
      headers: { link: linkHeader, 'x-wp-total': 2, 'x-wp-totalpages': 1 },
    });

    const result = await service.list();

    expect(mockedGet).toHaveBeenCalledWith('/wp-json/wc/store/v1/cart/coupons');
    expect(result.data).toEqual(data);
    expect(result.total).toBe(2);
    expect(result.link).toEqual({
      next: 'https://example.com/wp-json/wc/store/v1/cart/coupons?page=2',
    });
  });

  it('single() fetches coupon by code', async () => {
    const data = coupon('SAVE10');
    mockedGet.mockResolvedValue({ data });
    const result = await service.single('SAVE10');
    expect(mockedGet).toHaveBeenCalledWith(
      '/wp-json/wc/store/v1/cart/coupons/SAVE10'
    );
    expect(result.data).toEqual(data);
  });

  it('single() returns error when not found', async () => {
    const error: ApiError = {
      code: 'not_found',
      message: 'Missing',
      data: { status: 404 },
      details: {},
    };
    mockedGet.mockResolvedValue({ error });
    const result = await service.single('MISSING');
    expect(result.error).toEqual(error);
    expect(result.data).toBeUndefined();
  });

  const collectEvents = () => {
    const emitted: { event: string; payload: unknown }[] = [];
    events.onAny((e, p) => emitted.push({ event: e as string, payload: p }));
    return emitted;
  };

  it('add() emits loading and success events sequence', async () => {
    const emitted = collectEvents();
    const data = coupon('SAVE10');
    mockedPost.mockResolvedValue({ data });
    await service.add('SAVE10');
    expect(mockedPost).toHaveBeenCalledWith(
      '/wp-json/wc/store/v1/cart/coupons?code=SAVE10'
    );
    expect(emitted.map((e) => e.event)).toEqual([
      'cart:loading',
      'cart:request:start',
      'cart:request:success',
      'cart:loading',
    ]);
    // Loading toggled true then false
    expect(emitted[0].payload).toBe(true);
    expect(emitted.at(-1)?.payload).toBe(false);
  });

  it('add() emits error event on failure', async () => {
    const emitted = collectEvents();
    const error: ApiError = {
      code: 'invalid_coupon',
      message: 'Bad',
      data: { status: 400 },
      details: {},
    };
    mockedPost.mockResolvedValue({ error });
    const result = await service.add('BAD');
    expect(result.error).toEqual(error);
    expect(emitted.map((e) => e.event)).toEqual([
      'cart:loading',
      'cart:request:start',
      'cart:request:error',
      'cart:loading',
    ]);
  });

  it('delete() emits success events', async () => {
    const emitted = collectEvents();
    mockedDelete.mockResolvedValue({ data: {} });
    await service.delete('SAVE10');
    expect(mockedDelete).toHaveBeenCalledWith(
      '/wp-json/wc/store/v1/cart/coupons/SAVE10'
    );
    expect(emitted.map((e) => e.event)).toEqual([
      'cart:loading',
      'cart:request:start',
      'cart:request:success',
      'cart:loading',
    ]);
  });

  it('delete() emits error events', async () => {
    const emitted = collectEvents();
    const error: ApiError = {
      code: 'cannot_delete',
      message: 'Err',
      data: { status: 500 },
      details: {},
    };
    mockedDelete.mockResolvedValue({ error });
    await service.delete('SAVE10');
    expect(emitted.map((e) => e.event)).toEqual([
      'cart:loading',
      'cart:request:start',
      'cart:request:error',
      'cart:loading',
    ]);
  });

  it('clear() emits success events', async () => {
    const emitted = collectEvents();
    mockedDelete.mockResolvedValue({ data: [coupon('SAVE10')] });
    await service.clear();
    expect(mockedDelete).toHaveBeenCalledWith(
      '/wp-json/wc/store/v1/cart/coupons'
    );
    expect(emitted.map((e) => e.event)).toEqual([
      'cart:loading',
      'cart:request:start',
      'cart:request:success',
      'cart:loading',
    ]);
  });

  it('clear() emits error events', async () => {
    const emitted = collectEvents();
    const error: ApiError = {
      code: 'cannot_clear',
      message: 'Err',
      data: { status: 500 },
      details: {},
    };
    mockedDelete.mockResolvedValue({ error });
    await service.clear();
    expect(emitted.map((e) => e.event)).toEqual([
      'cart:loading',
      'cart:request:start',
      'cart:request:error',
      'cart:loading',
    ]);
  });
});
