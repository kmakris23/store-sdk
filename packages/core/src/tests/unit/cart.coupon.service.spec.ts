import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { CartCouponService } from '../../lib/services/store/cart.coupon.service';
import { cartCouponListMock } from '../services/cart.coupon.list.data';

const cartCoupotGetData = cartCouponListMock;

vi.mock('axios');
describe('CartCouponService', () => {
  const baseUrl = 'http://local.wordpress.test';
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
    const mockData = cartCoupotGetData;
    axiosMockInstance.get.mockResolvedValue(mockData);

    const result = await service.list();
    expect(axiosMockInstance.get).toHaveBeenCalledWith(
      `${baseUrl}/wp-json/wc/store/v1/cart/coupons`
    );
    expect(result).toEqual(mockData);
  });

  it('should call GET on single()', async () => {
    const mockData = cartCoupotGetData.at(0);
    axiosMockInstance.get.mockResolvedValue(mockData);

    const result = await service.single('20off');
    expect(axiosMockInstance.get).toHaveBeenCalledWith(
      `${baseUrl}/wp-json/wc/store/v1/cart/coupons/20off`
    );
    expect(result).toEqual(mockData);
  });

  it('should call POST on add()', async () => {
    const mockData = cartCoupotGetData.at(0);
    axiosMockInstance.post.mockResolvedValue(mockData);

    const result = await service.add('20off');
    expect(axiosMockInstance.post).toHaveBeenCalledWith(
      `${baseUrl}/wp-json/wc/store/v1/cart/coupons?code=20off`
    );
    expect(result).toEqual(mockData);
  });

  it('should call DELETE on delete()', async () => {
    const mockResponse = {};
    axiosMockInstance.delete.mockResolvedValue(mockResponse);

    const result = await service.delete('20off');
    expect(axiosMockInstance.delete).toHaveBeenCalledWith(
      `${baseUrl}/wp-json/wc/store/v1/cart/coupons/20off`
    );
    expect(result).toEqual(mockResponse);
  });

  it('should call DELETE on clear()', async () => {
    const mockData: unknown[] = [];
    axiosMockInstance.delete.mockResolvedValue(mockData);

    const result = await service.clear();
    expect(axiosMockInstance.delete).toHaveBeenCalledWith(
      `${baseUrl}/wp-json/wc/store/v1/cart/coupons`
    );
    expect(result).toEqual(mockData);
  });
});
