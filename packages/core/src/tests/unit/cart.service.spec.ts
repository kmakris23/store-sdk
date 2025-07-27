import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import qs from 'qs';
import { CartService } from '../../lib/services/store/cart.service.js';
import { CartItemEditRequest } from '../../lib/types/store/cart-item/cart.item.edit.request.js';
import { CartCustomerRequest } from '../../lib/types/store/cart/cart.customer.request.js';

vi.mock('axios');

describe('CartService', () => {
  const baseUrl = 'https://example.com';
  let service: CartService;
  let axiosMockInstance: any;

  beforeEach(() => {
    axiosMockInstance = {
      get: vi.fn(),
      post: vi.fn(),
    };

    axios.create = vi.fn(() => axiosMockInstance);
    service = new CartService(baseUrl);
  });

  it('should get cart', async () => {
    const mockResponse = { items: [] };
    axiosMockInstance.get.mockResolvedValue(mockResponse);

    const result = await service.get();
    expect(axiosMockInstance.get).toHaveBeenCalledWith(
      `${baseUrl}/wp-json/wc/store/v1/cart`
    );
    expect(result).toEqual(mockResponse);
  });

  it('should add item to cart', async () => {
    const input = { id: 1, quantity: 2 };
    const query = qs.stringify(input, { encode: true });
    const mockResponse = { items: ['item1'] };
    axiosMockInstance.post.mockResolvedValue(mockResponse);

    const result = await service.add(input);
    expect(axiosMockInstance.post).toHaveBeenCalledWith(
      `${baseUrl}/wp-json/wc/store/v1/cart/${query}`
    );
    expect(result).toEqual(mockResponse);
  });

  it('should update item in cart', async () => {
    const input: CartItemEditRequest = { id: 1, quantity: 3 };
    const query = qs.stringify(input, { encode: true });
    const mockResponse = { items: ['updated'] };
    axiosMockInstance.post.mockResolvedValue(mockResponse);

    const result = await service.update(input);
    expect(axiosMockInstance.post).toHaveBeenCalledWith(
      `${baseUrl}/wp-json/wc/store/v1/cart/${query}`
    );
    expect(result).toEqual(mockResponse);
  });

  it('should remove item from cart', async () => {
    const mockResponse = { items: [] };
    axiosMockInstance.post.mockResolvedValue(mockResponse);

    const result = await service.remove('item-key');
    expect(axiosMockInstance.post).toHaveBeenCalledWith(
      `${baseUrl}/wp-json/wc/store/v1/cart/item-key`
    );
    expect(result).toEqual(mockResponse);
  });

  it('should apply coupon', async () => {
    const mockResponse = { applied: true };
    axiosMockInstance.post.mockResolvedValue(mockResponse);

    const result = await service.applyCoupon('DISCOUNT20');
    expect(axiosMockInstance.post).toHaveBeenCalledWith(
      `${baseUrl}/wp-json/wc/store/v1/cart/apply-coupon/DISCOUNT20`
    );
    expect(result).toEqual(mockResponse);
  });

  it('should remove coupon', async () => {
    const mockResponse = { removed: true };
    axiosMockInstance.post.mockResolvedValue(mockResponse);

    const result = await service.removeCoupon('DISCOUNT20');
    expect(axiosMockInstance.post).toHaveBeenCalledWith(
      `${baseUrl}/wp-json/wc/store/v1/cart/remove-coupon/DISCOUNT20`
    );
    expect(result).toEqual(mockResponse);
  });

  it('should update customer', async () => {
    const input: CartCustomerRequest = {
      billing_address: {
        address_1: 'test',
        address_2: 'test',
        city: 'test',
        company: 'test',
        country: 'test',
        email: 'test@email.com',
        first_name: 'test',
        last_name: 'test',
        phone: 'test',
        postcode: '0034566',
        state: 'test',
      },
      shipping_address: {
        address_1: 'test',
        address_2: 'test',
        city: 'test',
        company: 'test',
        country: 'test',
        first_name: 'test',
        last_name: 'test',
        phone: 'test',
        postcode: '0034566',
        state: 'test',
      },
    };
    const mockResponse = { updated: true };
    axiosMockInstance.post.mockResolvedValue(mockResponse);

    const result = await service.updateCustomer(input);
    expect(axiosMockInstance.post).toHaveBeenCalledWith(
      `${baseUrl}/wp-json/wc/store/v1/cart/update-customer`,
      input
    );
    expect(result).toEqual(mockResponse);
  });

  it('should select shipping rate', async () => {
    const mockResponse = { shipping: 'selected' };
    axiosMockInstance.post.mockResolvedValue(mockResponse);

    const result = await service.selectShippingRate(1, 'flat_rate:2');
    expect(axiosMockInstance.post).toHaveBeenCalledWith(
      `${baseUrl}/wp-json/wc/store/v1/cart/select-shipping-rate/package_id=1&rate_id=flat_rate:2`
    );
    expect(result).toEqual(mockResponse);
  });
});
