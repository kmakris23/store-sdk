import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { ProductService } from '../../lib/services/store/product.service';
import { ProductRequest } from '../../lib/types/store/product/product.request';
import { ProductResponse } from '../../lib/types/store/product/product.response';
import { RequireAtLeastOne } from '../../lib/utilities/common';

vi.mock('axios');

describe('ProductService', () => {
  const baseUrl = 'https://example.com';
  let service: ProductService;
  let axiosMockInstance: any;

  beforeEach(() => {
    axiosMockInstance = { get: vi.fn() };
    axios.create = vi.fn(() => axiosMockInstance);
    service = new ProductService(baseUrl);
  });

//   it('should list products with standard and unstable_tax params', async () => {
//     const params: ProductRequest = {};

//     const expectedQuery =
//       'params%5Bpage%5D=1&params%5Bper_page%5D=10&unstable_tax=_unstable_tax_my-taxonomy=term-id&unstable_tax_operator=_unstable_tax_my-taxonomy_operator=in';

//     const expectedUrl = `${baseUrl}/wp-json/wc/store/v1/products?${expectedQuery}`;

//     const mockResponse: ProductResponse[] = [];

//     axiosMockInstance.get.mockResolvedValue(mockResponse);

//     const result = await service.list(params);

//     expect(axiosMockInstance.get).toHaveBeenCalledWith(expectedUrl);
//     expect(result).toEqual(mockResponse);
//   });

  it('should list products without params', async () => {
    const expectedUrl = `${baseUrl}/wp-json/wc/store/v1/products?unstable_tax=&unstable_tax_operator=`;

    axiosMockInstance.get.mockResolvedValue([]);

    const result = await service.list();

    expect(axiosMockInstance.get).toHaveBeenCalledWith(expectedUrl);
    expect(result).toEqual([]);
  });

  it('should get a single product by id', async () => {
    const mockProduct = {};

    const params: RequireAtLeastOne<{ id: number; slug: string }> = { id: 42 };
    const expectedUrl = `${baseUrl}/wp-json/wc/store/v1/products/42`;

    axiosMockInstance.get.mockResolvedValue(mockProduct);

    const result = await service.single(params);

    expect(axiosMockInstance.get).toHaveBeenCalledWith(expectedUrl);
    expect(result).toEqual(mockProduct);
  });

  it('should get a single product by slug', async () => {
    const mockProduct = {};

    const params: RequireAtLeastOne<{ id: number; slug: string }> = {
      slug: 'another-product',
    };
    const expectedUrl = `${baseUrl}/wp-json/wc/store/v1/products/another-product`;

    axiosMockInstance.get.mockResolvedValue(mockProduct);

    const result = await service.single(params);

    expect(axiosMockInstance.get).toHaveBeenCalledWith(expectedUrl);
    expect(result).toEqual(mockProduct);
  });
});
