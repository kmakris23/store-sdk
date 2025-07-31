import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CartItemService } from '../../../services/store/cart.item.service.js';
import {
  CartItemAddRequest,
  CartItemResponse,
} from '../../../types/store/index.js';
import { StoreSdkEventEmitter } from '../../../sdk.event.emitter.js';
import { StoreSdkConfig } from '../../../types/sdk.config.js';
import { StoreSdkState } from '../../../types/sdk.state.js';
import { ApiResult } from '../../../types/api.js';

class MockCartItemService extends CartItemService {
  override doGet = vi.fn();
  override doPost = vi.fn();
  override doPut = vi.fn();
  override doDelete = vi.fn();
}

vi.mock('axios');
describe('CartCouponService', () => {
  let service: MockCartItemService;
  const state: StoreSdkState = {};
  const config: StoreSdkConfig = {
    baseUrl: 'https://example.com',
  };
  const events = new StoreSdkEventEmitter();

  beforeEach(() => {
    service = new MockCartItemService(state, config, events);
  });

  it('should list cart items', async () => {
    const mockData: CartItemResponse[] = [
      { key: 'abc123' } as CartItemResponse,
    ];
    service.doGet.mockResolvedValue({ data: mockData, error: null });

    const result = await service.list();

    expect(service.doGet).toHaveBeenCalled();
    expect(result.data).toEqual(mockData);
  });

  it('should get a single cart item', async () => {
    const mockData = { key: 'item1' } as CartItemResponse;
    service.doGet.mockResolvedValue({ data: mockData, error: null });

    const result = await service.single('item1');

    expect(service.doGet).toHaveBeenCalledWith(
      expect.stringContaining('/item1'),
      expect.any(Object)
    );
    expect(result.data).toEqual(mockData);
  });

  it('should add cart item', async () => {
    const mockData = { key: 'item1' } as CartItemResponse;
    const params: CartItemAddRequest = {
      id: 123,
      quantity: 2,
    } as CartItemAddRequest;

    service.doPost.mockResolvedValue({ data: mockData, error: null });

    const result = await service.add(params);

    expect(service.doPost).toHaveBeenCalled();
    expect(result.data).toEqual(mockData);
  });

  it('should update cart item', async () => {
    const mockData = { key: 'item1', quantity: 5 } as CartItemResponse;
    service.doPut.mockResolvedValue({ data: mockData, error: null });

    const result = await service.update('item1', 5);

    expect(service.doPut).toHaveBeenCalledWith(
      expect.stringContaining('/item1'),
      undefined,
      expect.any(Object)
    );
    expect(result.data).toEqual(mockData);
  });

  it('should remove cart item', async () => {
    const mockResponse: ApiResult<unknown> = {
      data: { success: true },
      error: undefined,
    };
    service.doDelete.mockResolvedValue(mockResponse);

    const result = await service.remove('item1');

    expect(service.doDelete).toHaveBeenCalledWith(
      expect.stringContaining('/item1'),
      expect.any(Object)
    );
    expect(result).toEqual(mockResponse);
  });

  it('should clear all cart items', async () => {
    const mockData: CartItemResponse[] = [];
    service.doDelete.mockResolvedValue({ data: mockData, error: null });

    const result = await service.clear();

    expect(service.doDelete).toHaveBeenCalledWith(
      expect.stringContaining('/cart/items'),
      expect.any(Object)
    );
    expect(result.data).toEqual(mockData);
  });
});
