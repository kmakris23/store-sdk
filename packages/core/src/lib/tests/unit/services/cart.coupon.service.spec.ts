import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CartCouponService } from '../../../services/store/cart.coupon.service.js';
import { CartCouponResponse } from '../../../types/store/index.js';
import { StoreSdkEventEmitter } from '../../../sdk.event.emitter.js';
import { StoreSdkConfig } from '../../../types/sdk.config.js';
import { StoreSdkState } from '../../../types/sdk.state.js';

class MockCartCouponService extends CartCouponService {
  override doGet = vi.fn();
  override doPost = vi.fn();
  override doDelete = vi.fn();
}

describe('CartCouponService', () => {
  let service: MockCartCouponService;
  const state: StoreSdkState = {};
  const config: StoreSdkConfig = {
    baseUrl: 'https://example.com',
  };
  const events = new StoreSdkEventEmitter();

  beforeEach(() => {
    service = new MockCartCouponService(state, config, events);
  });

  it('list() should fetch all coupons', async () => {
    const mockData = [{ code: 'DISCOUNT10' }] as CartCouponResponse[];
    service.doGet.mockResolvedValue({ data: mockData, error: null });

    const result = await service.list();

    expect(service.doGet).toHaveBeenCalledWith(
      expect.stringContaining('/cart/coupons')
    );
    expect(result.data).toEqual(mockData);
    expect(result.error).toBeNull();
  });

  it('single() should fetch a single coupon by code', async () => {
    const mockData = { code: 'DISCOUNT10' } as CartCouponResponse;
    service.doGet.mockResolvedValue({ data: mockData, error: null });

    const result = await service.single('DISCOUNT10');

    expect(service.doGet).toHaveBeenCalledWith(
      expect.stringContaining('/cart/coupons/DISCOUNT10')
    );
    expect(result.data).toEqual(mockData);
  });

  it('add() should apply a coupon', async () => {
    const mockData = { code: 'DISCOUNT10' } as CartCouponResponse;
    service.doPost.mockResolvedValue({ data: mockData, error: null });

    const result = await service.add('DISCOUNT10');

    expect(service.doPost).toHaveBeenCalledWith(
      expect.stringContaining('code=DISCOUNT10')
    );
    expect(result.data).toEqual(mockData);
  });

  it('delete() should remove a coupon by code', async () => {
    service.doDelete.mockResolvedValue({ data: null, error: null });

    const result = await service.delete('DISCOUNT10');

    expect(service.doDelete).toHaveBeenCalledWith(
      expect.stringContaining('/cart/coupons/DISCOUNT10')
    );
    expect(result.error).toBeNull();
  });

  it('clear() should remove all coupons', async () => {
    const mockData = [{ code: 'DISCOUNT10' }] as CartCouponResponse[];
    service.doDelete.mockResolvedValue({ data: mockData, error: null });

    const result = await service.clear();

    expect(service.doDelete).toHaveBeenCalledWith(
      expect.stringContaining('/cart/coupons')
    );
    expect(result.data).toEqual(mockData);
  });
});
