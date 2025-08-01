import { StoreSdkEventEmitter } from '../../../sdk.event.emitter.js';
import { CheckoutService } from '../../../services/store/checkout.service.js';
import { StoreSdkConfig } from '../../../types/sdk.config.js';
import { StoreSdkState } from '../../../types/sdk.state.js';
import {
  CheckoutResponse,
  CheckoutUpdateRequest,
  CheckoutCreateRequest,
} from '../../../types/store/index.js';

class MockCheckoutService extends CheckoutService {
  doGet = vi.fn();
  doPut = vi.fn();
  doPost = vi.fn();
}

describe('CheckoutService', () => {
  let service: MockCheckoutService;
  const state: StoreSdkState = {};
  const config: StoreSdkConfig = {
    baseUrl: 'https://example.com',
  };
  const events = new StoreSdkEventEmitter();

  beforeEach(() => {
    service = new MockCheckoutService(state, config, events);
  });

  it('should get checkout data', async () => {
    const mockData = {} as CheckoutResponse;
    service.doGet.mockResolvedValue({ data: mockData, error: null });

    const result = await service.get();

    expect(service.doGet).toHaveBeenCalledWith(
      expect.stringContaining('/checkout/'),
      expect.any(Object)
    );
    expect(result.data).toEqual(mockData);
  });

  it('should update checkout data', async () => {
    const mockData = {} as CheckoutResponse;
    const updateParams: CheckoutUpdateRequest = {};

    service.doPut.mockResolvedValue({ data: mockData, error: null });

    const result = await service.update(updateParams, true);

    expect(service.doPut).toHaveBeenCalledWith(
      expect.stringContaining('__experimental_calc_totals=true'),
      undefined,
      expect.any(Object)
    );
    expect(result.data).toEqual(mockData);
  });

  it('should process order and payment', async () => {
    const mockData = {} as CheckoutResponse;
    const createParams: CheckoutCreateRequest = {
      billing_address: {
        address_1: 'test',
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
        postcode: '',
        state: '',
      },
    };

    service.doPost.mockResolvedValue({ data: mockData, error: null });

    const result = await service.processOrderAndPayment(createParams);
    expect(result.data).toEqual(mockData);
  });
});
