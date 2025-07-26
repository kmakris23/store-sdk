import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import qs from 'qs';
import { ProductCollectionDataService } from '../../lib/services/store/product.collection.data.service';
import { ProductCollectionDataRequest } from '../../lib/types/store/product-collection-data/product.collection.data.request';


vi.mock('axios');

describe('ProductCollectionDataService', () => {
  const baseUrl = 'https://example.com';
  let service: ProductCollectionDataService;
  let axiosMockInstance: any;

  beforeEach(() => {
    axiosMockInstance = { get: vi.fn() };
    axios.create = vi.fn(() => axiosMockInstance);
    service = new ProductCollectionDataService(baseUrl);
  });

  it('should calculate product collection data with query params', async () => {
    const params: ProductCollectionDataRequest = {};

    const mockResponse = {};

    axiosMockInstance.get.mockResolvedValue(mockResponse);

    const result = await service.calculate(params);

    const expectedQuery = qs.stringify(params, { encode: true });
    const expectedUrl = `${baseUrl}/wp-json/wc/store/v1/products/collection-data?${expectedQuery}`;

    expect(axiosMockInstance.get).toHaveBeenCalledWith(expectedUrl);
    expect(result).toEqual(mockResponse);
  });

  it('should calculate with empty params', async () => {
    const mockResponse = {};

    axiosMockInstance.get.mockResolvedValue(mockResponse);

    const result = await service.calculate();

    expect(axiosMockInstance.get).toHaveBeenCalledWith(
      `${baseUrl}/wp-json/wc/store/v1/products/collection-data?`
    );
    expect(result).toEqual(mockResponse);
  });
});
