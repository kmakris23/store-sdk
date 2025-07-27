import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { ProductAttributeTermService } from '../../lib/services/store/product.attribute.term.service.js';
import { ProductAttributeTermRequest } from '../../lib/types/store/product-attribute-term/product.attribute.term.request.js';

vi.mock('axios');

describe('ProductAttributeTermService', () => {
  const baseUrl = 'https://example.com';
  let service: ProductAttributeTermService;
  let axiosMockInstance: any;

  beforeEach(() => {
    axiosMockInstance = {
      get: vi.fn(),
    };

    axios.create = vi.fn(() => axiosMockInstance);
    service = new ProductAttributeTermService(baseUrl);
  });

  it('should fetch attribute terms with query parameters', async () => {
    const attributeId = 5;
    const params: ProductAttributeTermRequest = {
      id: 1,
      order: 'asc',
      orderby: 'count',
    };

    const mockResponse = [{ id: 101, name: 'Red' }];
    axiosMockInstance.get.mockResolvedValue(mockResponse);

    const result = await service.list(attributeId, params);

    expect(axiosMockInstance.get).toHaveBeenCalledWith(
      `${baseUrl}/wp-json/wc/store/v1/products/attributes/5/terms?id=1&order=asc&orderby=count`
    );
    expect(result).toEqual(mockResponse);
  });

  it('should fetch attribute terms without query parameters', async () => {
    const attributeId = 3;
    const mockResponse = [{ id: 1, name: 'Blue' }];
    axiosMockInstance.get.mockResolvedValue(mockResponse);

    const result = await service.list(attributeId);

    expect(axiosMockInstance.get).toHaveBeenCalledWith(
      `${baseUrl}/wp-json/wc/store/v1/products/attributes/3/terms?`
    );
    expect(result).toEqual(mockResponse);
  });
});
