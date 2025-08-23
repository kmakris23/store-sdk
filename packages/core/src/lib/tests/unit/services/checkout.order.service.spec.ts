import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
  type MockedFunction,
} from 'vitest';
import { CheckoutOrderService } from '../../../services/store/checkout.order.service.js';
import { StoreSdkConfig } from '../../../configs/sdk.config.js';
import { StoreSdkState } from '../../../types/sdk.state.js';
import { OrderRequest, CheckoutResponse } from '../../../types/store/index.js';
import { EventBus } from '../../../bus/event.bus.js';
import { StoreSdkEvent } from '../../../sdk.events.js';
import { ApiError } from '../../../types/api.js';

vi.mock('../../../utilities/axios.utility.js', () => ({ doPost: vi.fn() }));
import { doPost } from '../../../utilities/axios.utility.js';

describe('CheckoutOrderService', () => {
  let service: CheckoutOrderService;
  let mockedPost: MockedFunction<typeof doPost>;
  const state: StoreSdkState = {};
  const config: StoreSdkConfig = { baseUrl: 'https://example.com' };
  const events = new EventBus<StoreSdkEvent>();

  const checkout = (): CheckoutResponse =>
    ({ order_id: 123 } as unknown as CheckoutResponse);

  beforeEach(() => {
    mockedPost = doPost as unknown as MockedFunction<typeof doPost>;
    vi.clearAllMocks();
    service = new CheckoutOrderService(state, config, events);
  });

  it('processes order and payment', async () => {
    mockedPost.mockResolvedValue({ data: checkout() });
    const body: OrderRequest = {
      payment_method: 'cod',
      billing_address: {
        first_name: 'John',
        last_name: 'Doe',
        address_1: '123 Main St',
        city: 'Athens',
        postcode: '12345',
        country: 'GR',
        email: 'john@example.com',
      },
    } as OrderRequest;
    await service.order(123, body);
    const url = mockedPost.mock.calls[0][0];
    expect(url).toBe('/wp-json/wc/store/v1/checkout/123');
  });

  it('handles error', async () => {
    const error: ApiError = {
      code: 'err',
      message: 'fail',
      data: { status: 400 },
      details: {},
    };
    mockedPost.mockResolvedValue({ error });
    const body: OrderRequest = {
      payment_method: 'cod',
      billing_address: {
        first_name: 'A',
        last_name: 'B',
        address_1: '1',
        city: '',
        postcode: '',
        country: '',
        email: '',
      },
    } as OrderRequest;
    const result = await service.order(1, body);
    expect(result.error).toEqual(error);
  });
});
