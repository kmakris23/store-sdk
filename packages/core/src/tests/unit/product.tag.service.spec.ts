import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { ProductTagService } from '../../lib/services/store/product.tag.service.js';
import { ProductTagResponse } from '../../lib/types/store/product-tag/product.tag.response.js';

vi.mock('axios');

describe('ProductTagService', () => {
  const baseUrl = 'https://example.com';
  let service: ProductTagService;
  let axiosMockInstance: any;

  beforeEach(() => {
    axiosMockInstance = { get: vi.fn() };
    axios.create = vi.fn(() => axiosMockInstance);
    service = new ProductTagService(baseUrl);
  });

  it('should fetch list of product tags', async () => {
    const mockResponse: ProductTagResponse[] = [];

    axiosMockInstance.get.mockResolvedValue(mockResponse);

    const result = await service.list();

    expect(axiosMockInstance.get).toHaveBeenCalledWith(
      `${baseUrl}/wp-json/wc/store/v1/products/tag`
    );
    expect(result).toEqual(mockResponse);
  });
});
