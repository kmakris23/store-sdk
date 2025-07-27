import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { ProductCategoryService } from '../../lib/services/store/product.category.service.js';
import { ProductCategoryResponse } from '../../lib/types/store/product-category/product.category.response.js';

vi.mock('axios');

describe('ProductCategoryService', () => {
  const baseUrl = 'https://example.com';
  let service: ProductCategoryService;
  let axiosMockInstance: any;

  beforeEach(() => {
    axiosMockInstance = {
      get: vi.fn(),
    };
    axios.create = vi.fn(() => axiosMockInstance);
    service = new ProductCategoryService(baseUrl);
  });

  it('should fetch list of product categories', async () => {
    const mockResponse: ProductCategoryResponse[] = [];

    axiosMockInstance.get.mockResolvedValue(mockResponse);

    const result = await service.list();

    expect(axiosMockInstance.get).toHaveBeenCalledWith(
      `${baseUrl}/wp-json/wc/store/v1/products/categories`
    );
    expect(result).toEqual(mockResponse);
  });

  it('should fetch a single product category by ID', async () => {
    const categoryId = 99;
    const mockResponse = {};

    axiosMockInstance.get.mockResolvedValue(mockResponse);

    const result = await service.single(categoryId);

    expect(axiosMockInstance.get).toHaveBeenCalledWith(
      `${baseUrl}/wp-json/wc/store/v1/products/categories/${categoryId}`
    );
    expect(result).toEqual(mockResponse);
  });
});
