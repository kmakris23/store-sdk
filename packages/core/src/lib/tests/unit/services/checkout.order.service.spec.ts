import { StoreSdkEventEmitter } from '../../../sdk.event.emitter.js';
import { CheckoutOrderService } from '../../../services/store/checkout.order.service.js';
import { StoreSdkConfig } from '../../../types/sdk.config.js';
import { StoreSdkState } from '../../../types/sdk.state.js';
import { OrderRequest, CheckoutResponse } from '../../../types/store/index.js';

class MockCheckoutOrderService extends CheckoutOrderService {
  override doPost = vi.fn();
  override addNonceHeader = vi.fn().mockResolvedValue(undefined);
  override addCartTokenHeader = vi.fn().mockResolvedValue(undefined);
}

describe('CheckoutOrderService', () => {
  let service: MockCheckoutOrderService;
  const state: StoreSdkState = {};
  const config: StoreSdkConfig = {
    baseUrl: 'https://example.com',
  };
  const events = new StoreSdkEventEmitter();

  beforeEach(() => {
    service = new MockCheckoutOrderService(state, config, events);
  });

  it('should process order and payment', async () => {
    const orderId = 123;
    const requestBody: OrderRequest = {
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

    const mockData = {} as CheckoutResponse;
    service.doPost.mockResolvedValue({ data: mockData, error: null });

    const result = await service.order(orderId, requestBody);

    expect(service.addNonceHeader).toHaveBeenCalled();
    expect(service.addCartTokenHeader).toHaveBeenCalled();
    expect(service.doPost).toHaveBeenCalledWith(
      expect.stringContaining(`/checkout/${orderId}`),
      requestBody,
      expect.any(Object)
    );
    expect(result.data).toEqual(mockData);
  });
});
