import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { OrderService } from '../../lib/services/store/order.service';

vi.mock('axios');

describe('OrderService', () => {
  const baseUrl = 'https://example.com';
  let service: OrderService;
  let axiosMockInstance: any;

  beforeEach(() => {
    axiosMockInstance = {
      get: vi.fn(),
    };

    axios.create = vi.fn(() => axiosMockInstance);
    service = new OrderService(baseUrl);
  });

  it('should get an order without billingEmail', async () => {
    const key = 'securekey';
    const orderId = '12345';
    const mockResponse = { id: orderId, status: 'processing' };

    axiosMockInstance.get.mockResolvedValue(mockResponse);

    const result = await service.get(key, orderId);
    expect(axiosMockInstance.get).toHaveBeenCalledWith(
      `${baseUrl}/wp-json/wc/store/v1/order/${orderId}?key=${key}`
    );
    expect(result).toEqual(mockResponse);
  });

  it('should get an order with billingEmail', async () => {
    const key = 'securekey';
    const orderId = '12345';
    const billingEmail = 'test@example.com';
    const mockResponse = { id: orderId, status: 'completed' };

    axiosMockInstance.get.mockResolvedValue(mockResponse);

    const result = await service.get(key, orderId, billingEmail);
    expect(axiosMockInstance.get).toHaveBeenCalledWith(
      `${baseUrl}/wp-json/wc/store/v1/order/${orderId}?key=${key}&billing_email=${billingEmail}`
    );
    expect(result).toEqual(mockResponse);
  });
});
