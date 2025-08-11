import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProductBrandService } from '../../../services/store/product.brand.service.js';
import { ProductBrandResponse } from '../../../types/store/index.js';
import { Paginated } from '../../../types/store/paginated.js';
import { StoreSdkEventEmitter } from '../../../sdk.event.emitter.js';
import { StoreSdkConfig } from '../../../configs/sdk.config.js';
import { StoreSdkState } from '../../../types/sdk.state.js';

class MockProductBrandService extends ProductBrandService {
  doGet = vi.fn();
}

describe('ProductBrandService', () => {
  let service: MockProductBrandService;
  const state: StoreSdkState = {};
  const config: StoreSdkConfig = {
    baseUrl: 'https://example.com',
  };
  const events = new StoreSdkEventEmitter();

  beforeEach(() => {
    service = new MockProductBrandService(state, config, events);
  });

  it('should list product brands without params', async () => {
    const mockData = [
      { id: 1, name: 'Nike' },
      { id: 2, name: 'Adidas' },
    ] as ProductBrandResponse[];

    service.doGet.mockResolvedValue({ data: mockData, error: null });

    const result = await service.list();

    expect(service.doGet).toHaveBeenCalledWith(
      expect.stringContaining('/brands?')
    );
    expect(result.data).toEqual(mockData);
    expect(result.error).toBeNull();
  });

  it('should list product brands with pagination params', async () => {
    const mockData = [{ id: 3, name: 'Puma' }] as ProductBrandResponse[];
    const params: Paginated = { page: 2, per_page: 10 };

    service.doGet.mockResolvedValue({ data: mockData, error: null });

    const result = await service.list(params);

    expect(service.doGet).toHaveBeenCalledWith(
      expect.stringContaining('page=2&per_page=10')
    );
    expect(result.data).toEqual(mockData);
  });

  it('should fetch single brand by ID', async () => {
    const brandId = 5;
    const mockData = { id: brandId, name: 'Reebok' } as ProductBrandResponse;

    service.doGet.mockResolvedValue({ data: mockData, error: null });

    const result = await service.single(brandId);

    expect(service.doGet).toHaveBeenCalledWith(
      expect.stringContaining(`/brands/${brandId}`)
    );
    expect(result.data).toEqual(mockData);
    expect(result.error).toBeNull();
  });
});
