import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { CartCouponService } from '../../lib/services/store/cart.coupon.service';

vi.mock('axios');
describe('CartCouponService', () => {
  const baseUrl = 'https://example.com';
  let service: CartCouponService;
  let axiosMockInstance: any;

  beforeEach(() => {
    axiosMockInstance = {
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
    };

    axios.create = vi.fn(() => axiosMockInstance);
    service = new CartCouponService(baseUrl);
  });

  it('should call GET on list()', async () => {
    const mockData = [{ code: 'SUMMER20' }];
    axiosMockInstance.get.mockResolvedValue(mockData);

    const result = await service.list();
    expect(axiosMockInstance.get).toHaveBeenCalledWith(
      `${baseUrl}/wp-json/wc/store/v1/cart/coupons`
    );
    expect(result).toEqual(mockData);
  });

  it('should call GET on single()', async () => {
    const mockData = { code: 'DISCOUNT10' };
    axiosMockInstance.get.mockResolvedValue(mockData);

    const result = await service.single('DISCOUNT10');
    expect(axiosMockInstance.get).toHaveBeenCalledWith(
      `${baseUrl}/wp-json/wc/store/v1/cart/coupons/DISCOUNT10`
    );
    expect(result).toEqual(mockData);
  });

  it('should call POST on add()', async () => {
    const mockData = { code: 'NEWCODE' };
    axiosMockInstance.post.mockResolvedValue(mockData);

    const result = await service.add('NEWCODE');
    expect(axiosMockInstance.post).toHaveBeenCalledWith(
      `${baseUrl}/wp-json/wc/store/v1/cart/coupons?code=NEWCODE`
    );
    expect(result).toEqual(mockData);
  });

  it('should call DELETE on delete()', async () => {
    const mockResponse = { success: true };
    axiosMockInstance.delete.mockResolvedValue(mockResponse);

    const result = await service.delete('OLDCOUPON');
    expect(axiosMockInstance.delete).toHaveBeenCalledWith(
      `${baseUrl}/wp-json/wc/store/v1/cart/coupons/OLDCOUPON`
    );
    expect(result).toEqual(mockResponse);
  });

  it('should call DELETE on clear()', async () => {
    const mockData = [{ code: 'A' }, { code: 'B' }];
    axiosMockInstance.delete.mockResolvedValue(mockData);

    const result = await service.clear();
    expect(axiosMockInstance.delete).toHaveBeenCalledWith(
      `${baseUrl}/wp-json/wc/store/v1/cart/coupons`
    );
    expect(result).toEqual(mockData);
  });
});
