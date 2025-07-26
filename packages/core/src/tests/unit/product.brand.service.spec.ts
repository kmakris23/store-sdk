import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { ProductBrandService } from '../../lib/services/store/product.brand.service';
import { ProductBrandResponse } from '../../lib/types/store/product-brand/product.brand.response';

vi.mock('axios');

describe('ProductBrandService', () => {
  const baseUrl = 'https://example.com';
  let service: ProductBrandService;
  let axiosMockInstance: any;

  beforeEach(() => {
    axiosMockInstance = {
      get: vi.fn(),
    };
    axios.create = vi.fn(() => axiosMockInstance);
    service = new ProductBrandService(baseUrl);
  });

  it('should fetch list of product brands', async () => {
    const mockResponse: ProductBrandResponse[] = [];

    axiosMockInstance.get.mockResolvedValue(mockResponse);

    const result = await service.list();

    expect(axiosMockInstance.get).toHaveBeenCalledWith(
      `${baseUrl}/wp-json/wc/store/v1/products/brands`
    );
    expect(result).toEqual(mockResponse);
  });

  it('should fetch single product brand by ID', async () => {
    const brandId = 42;
    const mockResponse = {};

    axiosMockInstance.get.mockResolvedValue(mockResponse);

    const result = await service.single(brandId);

    expect(axiosMockInstance.get).toHaveBeenCalledWith(
      `${baseUrl}/wp-json/wc/store/v1/products/brands/${brandId}`
    );
    expect(result).toEqual(mockResponse);
  });
});
