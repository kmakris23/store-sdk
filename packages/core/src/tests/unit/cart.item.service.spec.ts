import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { CartItemService } from '../../lib/services/store/cart.item.service.js';
import { cartItemData } from '../services/cart.item.data.js';
import { CartItemResponse } from '../../lib/types/store/cart-item/cart.item.response.js';
import qs from 'qs';
import { CartItemAddRequest } from '../../lib/types/store/cart-item/cart.item.add.request.js';

const mockResponse = cartItemData as CartItemResponse[];

vi.mock('axios');
describe('CartCouponService', () => {
  const baseUrl = 'http://local.wordpress.test';
  let service: CartItemService;
  let axiosMockInstance: any;

  beforeEach(() => {
    axiosMockInstance = {
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
    };

    axios.create = vi.fn(() => axiosMockInstance);
    service = new CartItemService(baseUrl);
  });

  it('should list cart items', async () => {
    const mockData = mockResponse;
    axiosMockInstance.get.mockResolvedValue(mockData);

    const result = await service.list();
    expect(axiosMockInstance.get).toHaveBeenCalledWith(
      `${baseUrl}/wp-json/wc/store/v1/cart/items`
    );
    expect(result).toEqual(mockData);
  });

  it('should get a single cart item', async () => {
    const key = 'c74d97b01eae257e44aa9d5bade97baf';
    const mockData = mockResponse.find((e) => e.key === key);
    axiosMockInstance.get.mockResolvedValue(mockData);

    const result = await service.single(key);
    expect(axiosMockInstance.get).toHaveBeenCalledWith(
      `${baseUrl}/wp-json/wc/store/v1/cart/items/${key}`
    );
    expect(result).toEqual(mockData);
  });

  it('should add a cart item', async () => {
    const mockData = mockResponse;
    const params: CartItemAddRequest = { id: 1, quantity: 2 };
    const query = qs.stringify(params, { encode: true });

    axiosMockInstance.post.mockResolvedValue(mockData);

    const result = await service.add(params);
    expect(axiosMockInstance.post).toHaveBeenCalledWith(
      `${baseUrl}/wp-json/wc/store/v1/cart/items/${query}`
    );
    expect(result).toEqual(mockData);
  });

  it('should update a cart item', async () => {
    const mockData = mockResponse;
    const params: CartItemAddRequest = { id: 1, quantity: 2 };
    const query = qs.stringify(params, { encode: true });
    axiosMockInstance.post.mockResolvedValue(mockData);

    const result = await service.update(params);
    expect(axiosMockInstance.post).toHaveBeenCalledWith(
      `${baseUrl}/wp-json/wc/store/v1/cart/items/items/${query}`
    );
    expect(result).toEqual(mockData);
  });

  it('should remove a cart item', async () => {
    const key = 'c74d97b01eae257e44aa9d5bade97baf';
    axiosMockInstance.delete.mockResolvedValue(mockResponse);

    const result = await service.remove(key);
    expect(axiosMockInstance.delete).toHaveBeenCalledWith(
      `${baseUrl}/wp-json/wc/store/v1/cart/items/items/${key}`
    );
    expect(result).toEqual(mockResponse);
  });

  it('should clear all cart items', async () => {
    const mockData: CartItemResponse[] = [];
    axiosMockInstance.delete.mockResolvedValue(mockData);

    const result = await service.clear();
    expect(axiosMockInstance.delete).toHaveBeenCalledWith(
      `${baseUrl}/wp-json/wc/store/v1/cart/items`
    );
    expect(result).toEqual(mockData);
  });
});
