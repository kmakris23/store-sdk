import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProductService } from '../../../services/store/product.service.js';
import { ProductResponse, ProductRequest } from '../../../types/store/index.js';
import { StoreSdkEventEmitter } from '../../../sdk.event.emitter.js';
import { StoreSdkConfig } from '../../../types/sdk.config.js';
import { StoreSdkState } from '../../../types/sdk.state.js';

class MockProductService extends ProductService {
  doGet = vi.fn();
}

describe('ProductService', () => {
  let service: MockProductService;
  const state: StoreSdkState = {};
  const config: StoreSdkConfig = {
    baseUrl: 'https://example.com',
  };
  const events = new StoreSdkEventEmitter();

  beforeEach(() => {
    service = new MockProductService(state, config, events);
  });

  it('should list products without params', async () => {
    const mockData = [
      { id: 1, name: 'Product A' },
      { id: 2, name: 'Product B' },
    ] as ProductResponse[];

    service.doGet.mockResolvedValue({ data: mockData, error: null });

    const result = await service.list();

    expect(service.doGet).toHaveBeenCalledWith(
      expect.stringContaining('/products?')
    );
    expect(result.data).toEqual(mockData);
    expect(result.error).toBeNull();
  });

  it('should list products with unstable_tax params serialized', async () => {
    const params: ProductRequest = {
      _unstable_tax_: [{ term: 'term1' }],
      _unstable_tax_operator: [{ term: 'in' }],
      per_page: 5,
    };

    const mockData = [{ id: 3, name: 'Product C' }] as ProductResponse[];
    service.doGet.mockResolvedValue({ data: mockData, error: null });

    const result = await service.list(params);

    // The query string should include unstable_tax and unstable_tax_operator keys as concatenated strings
    expect(service.doGet).toHaveBeenCalledWith(
      expect.stringContaining('_unstable_tax_term=term1')
    );
    expect(service.doGet).toHaveBeenCalledWith(
      expect.stringContaining('_unstable_tax_term_operator=in')
    );
    expect(service.doGet).toHaveBeenCalledWith(
      expect.stringContaining('per_page=5')
    );
    expect(result.data).toEqual(mockData);
  });

  it('should get single product by id', async () => {
    const mockData = { id: 123, name: 'Single Product' } as ProductResponse;
    service.doGet.mockResolvedValue({ data: mockData, error: null });

    const result = await service.single({ id: 123 });

    expect(service.doGet).toHaveBeenCalledWith(
      expect.stringContaining('/products/123')
    );
    expect(result.data).toEqual(mockData);
  });

  it('should get single product by slug', async () => {
    const mockData = { id: 456, name: 'Slug Product' } as ProductResponse;
    service.doGet.mockResolvedValue({ data: mockData, error: null });

    const result = await service.single({ slug: 'product-slug' });

    expect(service.doGet).toHaveBeenCalledWith(
      expect.stringContaining('/products/product-slug')
    );
    expect(result.data).toEqual(mockData);
  });
});
