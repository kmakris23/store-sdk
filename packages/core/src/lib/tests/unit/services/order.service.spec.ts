import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrderService } from '../../../services/store/order.service.js';
import { OrderResponse } from '../../../types/store/index.js';
import { StoreSdkEventEmitter } from '../../../sdk.event.emitter.js';
import { StoreSdkConfig } from '../../../types/sdk.config.js';
import { StoreSdkState } from '../../../types/sdk.state.js';

class MockOrderService extends OrderService {
  doGet = vi.fn();
}

describe('OrderService', () => {
  let service: MockOrderService;
  const state: StoreSdkState = {};
  const config: StoreSdkConfig = {
    baseUrl: 'https://example.com',
  };
  const events = new StoreSdkEventEmitter();

  beforeEach(() => {
    service = new MockOrderService(state, config, events);
  });

  it('should get order with billing email', async () => {
    const mockData = { id: 123 } as OrderResponse;
    service.doGet.mockResolvedValue({ data: mockData, error: null });

    const key = 'securekey';
    const orderId = '123';
    const billingEmail = 'test@example.com';

    const result = await service.get(key, orderId, billingEmail);

    expect(service.doGet).toHaveBeenCalledWith(
      expect.stringContaining(`key=${key}`),
      expect.any(Object)
    );

    expect(service.doGet.mock.calls[0][0]).toContain(
      `billing_email=${billingEmail}`
    );

    expect(result.data).toEqual(mockData);
    expect(result.error).toBeNull();
  });

  it('should get order without billing email', async () => {
    const mockData = { id: 456 } as OrderResponse;
    service.doGet.mockResolvedValue({ data: mockData, error: null });

    const result = await service.get('securekey', '456');

    expect(service.doGet.mock.calls[0][0]).not.toContain('billing_email=');
    expect(result.data).toEqual(mockData);
  });
});
