import { StoreSdkEventEmitter } from '../../../sdk.event.emitter.js';
import { CartService } from '../../../services/store/cart.service.js';
import { StoreSdkConfig } from '../../../configs/sdk.config.js';
import { StoreSdkState } from '../../../types/sdk.state.js';
import {
  CartResponse,
  CartItemAddRequest,
  CartCustomerRequest,
} from '../../../types/store/index.js';

class MockCartService extends CartService {
  doGet = vi.fn();
  doPost = vi.fn();
}

describe('CartService', () => {
  let service: MockCartService;
  const state: StoreSdkState = {};
  const config: StoreSdkConfig = {
    baseUrl: 'https://example.com',
  };
  const events = new StoreSdkEventEmitter();

  beforeEach(() => {
    service = new MockCartService(state, config, events);
  });

  it('should get cart', async () => {
    const mockData = { items_count: 2 } as CartResponse;
    const mockHeaders = {
      'x-wc-nonce': 'abc123',
      'x-cart-token': 'def456',
    };

    service.doGet.mockResolvedValue({
      data: mockData,
      error: null,
      headers: mockHeaders,
    });

    const result = await service.get();

    expect(service.doGet).toHaveBeenCalled();
    expect(result.data).toEqual(mockData);
  });

  it('should add item to cart', async () => {
    const params: CartItemAddRequest = {
      id: 1,
      quantity: 2,
    } as CartItemAddRequest;
    const mockData = { items_count: 1 } as CartResponse;

    service.doPost.mockResolvedValue({ data: mockData, error: null });

    const result = await service.add(params);

    expect(service.doPost).toHaveBeenCalled();
    expect(result.data).toEqual(mockData);
  });

  it('should update item in cart', async () => {
    const mockData = { items_count: 1 } as CartResponse;
    service.doPost.mockResolvedValue({ data: mockData, error: null });

    const result = await service.update('itemKey', 3);

    expect(service.doPost).toHaveBeenCalledWith(
      expect.stringContaining('update-item'),
      undefined,
      expect.any(Object)
    );
    expect(result.data).toEqual(mockData);
  });

  it('should remove item from cart', async () => {
    const mockData = { items_count: 0 } as CartResponse;
    service.doPost.mockResolvedValue({ data: mockData, error: null });

    expect(service.doPost).toHaveBeenCalledWith(
      expect.stringContaining('remove-item'),
      undefined,
      expect.any(Object)
    );
  });

  it('should apply coupon', async () => {
    const mockData = { items_count: 1 } as CartResponse;
    service.doPost.mockResolvedValue({ data: mockData, error: null });

    expect(service.doPost).toHaveBeenCalledWith(
      expect.stringContaining('/apply-coupon/SAVE20'),
      undefined,
      expect.any(Object)
    );
  });

  it('should remove coupon', async () => {
    const mockData = { items_count: 1 } as CartResponse;
    service.doPost.mockResolvedValue({ data: mockData, error: null });

    expect(service.doPost).toHaveBeenCalledWith(
      expect.stringContaining('/remove-coupon/SAVE20'),
      undefined,
      expect.any(Object)
    );
  });

  it('should update customer', async () => {
    const mockData = { items_count: 1 } as CartResponse;
    const body: CartCustomerRequest = {
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
        phone: '',
        postcode: '',
        state: '',
      },
    } as CartCustomerRequest;

    service.doPost.mockResolvedValue({ data: mockData, error: null });

    expect(service.doPost).toHaveBeenCalledWith(
      expect.stringContaining('/update-customer'),
      body,
      expect.any(Object)
    );
  });

  it('should select shipping rate', async () => {
    const mockData = { items_count: 1 } as CartResponse;

    service.doPost.mockResolvedValue({ data: mockData, error: null });

    expect(service.doPost).toHaveBeenCalledWith(
      expect.stringContaining('package_id=5&rate_id=flat_rate'),
      undefined,
      expect.any(Object)
    );
  });
});
