import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import qs from 'qs';
import { CheckoutService } from '../../lib/services/store/checkout.service';
import { CheckoutUpdateRequest } from '../../lib/types/store/checkout/checkout.update.request';
import { CheckoutCreateRequest } from '../../lib/types/store/checkout/checkout.create.request';
import { OrderRequest } from '../../lib/types/store/order/order.request';

vi.mock('axios');

describe('CheckoutService', () => {
  const baseUrl = 'https://example.com';
  let service: CheckoutService;
  let axiosMockInstance: any;

  beforeEach(() => {
    axiosMockInstance = {
      get: vi.fn(),
      put: vi.fn(),
      post: vi.fn(),
    };

    axios.create = vi.fn(() => axiosMockInstance);
    service = new CheckoutService(baseUrl);
  });

  it('should get checkout data', async () => {
    const mockResponse = { checkout: true };
    axiosMockInstance.get.mockResolvedValue(mockResponse);

    const result = await service.get();
    expect(axiosMockInstance.get).toHaveBeenCalledWith(
      `${baseUrl}/wp-json/wc/store/v1/checkout/`
    );
    expect(result).toEqual(mockResponse);
  });

  it('should update checkout data with experimental_calc_totals', async () => {
    const input: CheckoutUpdateRequest = {};
    const query = qs.stringify(input, { encode: true });
    const mockResponse = { updated: true };

    axiosMockInstance.put.mockResolvedValue(mockResponse);

    const result = await service.update(input, true);
    expect(axiosMockInstance.put).toHaveBeenCalledWith(
      `${baseUrl}/wp-json/wc/store/v1/checkout/?__experimental_calc_totals=true&${query}`
    );
    expect(result).toEqual(mockResponse);
  });

  it('should update checkout data with experimental_calc_totals = false', async () => {
    const input: CheckoutUpdateRequest = {};
    const query = qs.stringify(input, { encode: true });
    const mockResponse = { updated: true };

    axiosMockInstance.put.mockResolvedValue(mockResponse);

    const result = await service.update(input);
    expect(axiosMockInstance.put).toHaveBeenCalledWith(
      `${baseUrl}/wp-json/wc/store/v1/checkout/?__experimental_calc_totals=false&${query}`
    );
    expect(result).toEqual(mockResponse);
  });

  it('should create an order', async () => {
    const input: CheckoutCreateRequest = {
      payment_method: 'cod',
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
        postcode: '0034566',
        state: 'test',
      },
      extensions: {},
    };
    const query = qs.stringify(input, { encode: true });
    const mockResponse = { order_created: true };

    axiosMockInstance.post.mockResolvedValue(mockResponse);

    const result = await service.create(input);
    expect(axiosMockInstance.post).toHaveBeenCalledWith(
      `${baseUrl}/wp-json/wc/store/v1/checkout/${query}`
    );
    expect(result).toEqual(mockResponse);
  });

  it('should send order request', async () => {
    const input: OrderRequest = {
      key: 'wc_order_oFmQYREzh9Tfv',
      billing_email: 'admin@example.com',
      billing_address: {
        first_name: 'Peter',
        last_name: 'Venkman',
        company: '',
        address_1: '550 Central Park West',
        address_2: 'Corner Penthouse Spook Central',
        city: 'New York',
        state: 'NY',
        postcode: '10023',
        country: 'US',
        email: 'admin@example.com',
        phone: '555-2368',
      },
      shipping_address: {
        first_name: 'Peter',
        last_name: 'Venkman',
        company: '',
        address_1: '550 Central Park West',
        address_2: 'Corner Penthouse Spook Central',
        city: 'New York',
        state: 'NY',
        postcode: '10023',
        country: 'US',
        phone: '555-2368',
      },
      payment_method: 'cheque',
      payment_data: [],
    };
    const mockResponse = { order: 'confirmed' };

    axiosMockInstance.post.mockResolvedValue(mockResponse);

    const result = await service.order(12345, input);
    expect(axiosMockInstance.post).toHaveBeenCalledWith(
      `${baseUrl}/wp-json/wc/store/v1/checkout/12345`,
      input
    );
    expect(result).toEqual(mockResponse);
  });
});
