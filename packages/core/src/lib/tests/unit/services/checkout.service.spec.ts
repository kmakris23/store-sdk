import { describe, it, expect, beforeEach, vi, type MockedFunction } from 'vitest';
import { CheckoutService } from '../../../services/store/checkout.service.js';
import { StoreSdkConfig } from '../../../configs/sdk.config.js';
import { StoreSdkState } from '../../../types/sdk.state.js';
import { CheckoutResponse, CheckoutUpdateRequest, CheckoutCreateRequest } from '../../../types/store/index.js';
import { EventBus } from '../../../bus/event.bus.js';
import { StoreSdkEvent } from '../../../sdk.events.js';
import { ApiError } from '../../../types/api.js';

vi.mock('../../../utilities/axios.utility.js', () => ({ doGet: vi.fn(), doPut: vi.fn(), doPost: vi.fn() }));
import { doGet, doPut, doPost } from '../../../utilities/axios.utility.js';

describe('CheckoutService', () => {
  let service: CheckoutService;
  let mockedGet: MockedFunction<typeof doGet>;
  let mockedPut: MockedFunction<typeof doPut>;
  let mockedPost: MockedFunction<typeof doPost>;
  const state: StoreSdkState = {};
  const config: StoreSdkConfig = { baseUrl: 'https://example.com' };
  const events = new EventBus<StoreSdkEvent>();

  const checkout = (): CheckoutResponse => ({
    order_id: 1,
    customer_id: 0,
    redirects: [],
    status: 'pending',
    order_key: 'abc',
  } as unknown as CheckoutResponse);

  beforeEach(() => {
    mockedGet = doGet as unknown as MockedFunction<typeof doGet>;
    mockedPut = doPut as unknown as MockedFunction<typeof doPut>;
    mockedPost = doPost as unknown as MockedFunction<typeof doPost>;
    vi.clearAllMocks();
    service = new CheckoutService(state, config, events);
  });

  it('gets checkout data', async () => {
    mockedGet.mockResolvedValue({ data: checkout() });
    const result = await service.get();
    const url = mockedGet.mock.calls[0][0];
    expect(url).toBe('/wp-json/wc/store/v1/checkout/');
    expect(result.data?.order_id).toBe(1);
  });

  it('updates checkout data with calc totals', async () => {
    mockedPut.mockResolvedValue({ data: checkout() });
    const params: CheckoutUpdateRequest = {};
    await service.update(params, true);
    const url = mockedPut.mock.calls[0][0];
    expect(url).toContain('__experimental_calc_totals=true');
  });

  it('processes order and payment', async () => {
    mockedPost.mockResolvedValue({ data: checkout() });
    const createParams: CheckoutCreateRequest = {
      billing_address: { address_1: 'a', address_2: '', city: '', company: '', country: '', email: '', first_name: '', last_name: '', phone: '', postcode: '', state: '' },
      shipping_address: { address_1: '', address_2: '', city: '', company: '', country: '', first_name: '', last_name: '', postcode: '', state: '' },
    };
    await service.processOrderAndPayment(createParams);
    const url = mockedPost.mock.calls[0][0];
    expect(url).toContain('billing_address%5Baddress_1%5D=a');
  });

  it('handles error on update', async () => {
    const error: ApiError = { code: 'err', message: 'fail', data: { status:400 }, details: {} };
    mockedPut.mockResolvedValue({ error });
    const result = await service.update({}, false);
    expect(result.error).toEqual(error);
  });

  it('handles error on process', async () => {
    const error: ApiError = { code: 'err', message: 'fail', data: { status:500 }, details: {} };
    mockedPost.mockResolvedValue({ error });
    const createParams: CheckoutCreateRequest = {
      billing_address: { address_1: 'a', address_2: '', city: '', company: '', country: '', email: '', first_name: '', last_name: '', phone: '', postcode: '', state: '' },
      shipping_address: { address_1: '', address_2: '', city: '', company: '', country: '', first_name: '', last_name: '', postcode: '', state: '' },
    };
    const result = await service.processOrderAndPayment(createParams);
    expect(result.error).toEqual(error);
  });
});
