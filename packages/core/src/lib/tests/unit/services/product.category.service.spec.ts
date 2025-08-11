import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProductCategoryService } from '../../../services/store/product.category.service.js';
import {
  ProductCategoryResponse,
  ProductCategoryRequest,
} from '../../../types/store/index.js';
import { StoreSdkEventEmitter } from '../../../sdk.event.emitter.js';
import { StoreSdkConfig } from '../../../configs/sdk.config.js';
import { StoreSdkState } from '../../../types/sdk.state.js';

class MockProductCategoryService extends ProductCategoryService {
  doGet = vi.fn();
}

describe('ProductCategoryService', () => {
  let service: MockProductCategoryService;
  const state: StoreSdkState = {};
  const config: StoreSdkConfig = {
    baseUrl: 'https://example.com',
  };
  const events = new StoreSdkEventEmitter();

  beforeEach(() => {
    service = new MockProductCategoryService(state, config, events);
  });

  it('should list product categories without params', async () => {
    const mockData = [
      { id: 1, name: 'Clothing' },
      { id: 2, name: 'Accessories' },
    ] as ProductCategoryResponse[];

    service.doGet.mockResolvedValue({ data: mockData, error: null });

    const result = await service.list();

    expect(service.doGet).toHaveBeenCalledWith(
      expect.stringContaining('/products/categories?')
    );
    expect(result.data).toEqual(mockData);
    expect(result.error).toBeNull();
  });

  it('should list product categories with query params', async () => {
    const params: ProductCategoryRequest = { per_page: 5, page: 1 };
    const mockData = [{ id: 3, name: 'Shoes' }] as ProductCategoryResponse[];

    service.doGet.mockResolvedValue({ data: mockData, error: null });

    const result = await service.list(params);

    expect(service.doGet).toHaveBeenCalledWith(
      expect.stringContaining('per_page=5&page=1')
    );
    expect(result.data).toEqual(mockData);
  });

  it('should get a single product category by ID', async () => {
    const id = 10;
    const mockData = { id, name: 'Hats' } as ProductCategoryResponse;

    service.doGet.mockResolvedValue({ data: mockData, error: null });

    const result = await service.single(id);

    expect(service.doGet).toHaveBeenCalledWith(
      expect.stringContaining(`/products/categories/${id}`)
    );
    expect(result.data).toEqual(mockData);
    expect(result.error).toBeNull();
  });
});
