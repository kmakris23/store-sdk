import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProductCollectionDataService } from '../../../services/store/product.collection.data.service.js';
import {
  ProductCollectionDataResponse,
  ProductCollectionDataRequest,
} from '../../../types/store/index.js';
import { StoreSdkEventEmitter } from '../../../sdk.event.emitter.js';
import { StoreSdkConfig } from '../../../types/sdk.config.js';
import { StoreSdkState } from '../../../types/sdk.state.js';

class MockProductCollectionDataService extends ProductCollectionDataService {
  override doGet = vi.fn();
}

describe('ProductCollectionDataService', () => {
  let service: MockProductCollectionDataService;
  const state: StoreSdkState = {};
  const config: StoreSdkConfig = {
    baseUrl: 'https://example.com',
  };
  const events = new StoreSdkEventEmitter();

  beforeEach(() => {
    service = new MockProductCollectionDataService(state, config, events);
  });

  it('should calculate collection data without params', async () => {
    const mockData = {} as ProductCollectionDataResponse;
    service.doGet.mockResolvedValue({ data: mockData, error: null });

    const result = await service.calculate();

    expect(service.doGet).toHaveBeenCalledWith(
      expect.stringContaining('/products/collection-data?')
    );
    expect(result.data).toEqual(mockData);
    expect(result.error).toBeNull();
  });

  it('should calculate collection data with params', async () => {
    const params: ProductCollectionDataRequest = {};
    const mockData = {} as ProductCollectionDataResponse;
    service.doGet.mockResolvedValue({ data: mockData, error: null });

    const result = await service.calculate(params);
    expect(result.data).toEqual(mockData);
  });
});
