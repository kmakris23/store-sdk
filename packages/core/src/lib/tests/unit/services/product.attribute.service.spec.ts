import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProductAttributeService } from '../../../services/store/product.attribute.service.js';
import { ProductAttributeResponse } from '../../../types/store/index.js';
import { StoreSdkEventEmitter } from '../../../sdk.event.emitter.js';
import { StoreSdkConfig } from '../../../configs/sdk.config.js';
import { StoreSdkState } from '../../../types/sdk.state.js';

class MockProductAttributeService extends ProductAttributeService {
  doGet = vi.fn();
}

describe('ProductAttributeService', () => {
  let service: MockProductAttributeService;
  const state: StoreSdkState = {};
  const config: StoreSdkConfig = {
    baseUrl: 'https://example.com',
  };
  const events = new StoreSdkEventEmitter();

  beforeEach(() => {
    service = new MockProductAttributeService(state, config, events);
  });

  it('should list all product attributes', async () => {
    const mockData = [{ id: 1, name: 'Color' }] as ProductAttributeResponse[];
    service.doGet.mockResolvedValue({ data: mockData, error: null });

    const result = await service.list();

    expect(service.doGet).toHaveBeenCalledWith(
      expect.stringContaining('/products/attributes')
    );
    expect(result.data).toEqual(mockData);
    expect(result.error).toBeNull();
  });

  it('should fetch single product attribute by ID', async () => {
    const id = 5;
    const mockData = { id, name: 'Size' } as ProductAttributeResponse;
    service.doGet.mockResolvedValue({ data: mockData, error: null });

    const result = await service.single(id);

    expect(service.doGet).toHaveBeenCalledWith(
      expect.stringContaining(`/products/attributes/${id}`)
    );
    expect(result.data).toEqual(mockData);
    expect(result.error).toBeNull();
  });
});
