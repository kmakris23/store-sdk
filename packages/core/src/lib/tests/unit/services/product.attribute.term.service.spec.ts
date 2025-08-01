import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProductAttributeTermService } from '../../../services/store/product.attribute.term.service.js';
import {
  ProductAttributeResponse,
  ProductAttributeTermRequest,
} from '../../../types/store/index.js';
import { StoreSdkEventEmitter } from '../../../sdk.event.emitter.js';
import { StoreSdkConfig } from '../../../types/sdk.config.js';
import { StoreSdkState } from '../../../types/sdk.state.js';

class MockProductAttributeTermService extends ProductAttributeTermService {
  doGet = vi.fn();
}

describe('ProductAttributeTermService', () => {
  let service: MockProductAttributeTermService;
  const state: StoreSdkState = {};
  const config: StoreSdkConfig = {
    baseUrl: 'https://example.com',
  };
  const events = new StoreSdkEventEmitter();

  beforeEach(() => {
    service = new MockProductAttributeTermService(state, config, events);
  });

  it('should list attribute terms without params', async () => {
    const attributeId = 10;
    const mockData = [
      { id: 1, name: 'Red' },
      { id: 2, name: 'Blue' },
    ] as ProductAttributeResponse[];
    service.doGet.mockResolvedValue({ data: mockData, error: null });

    const result = await service.list(attributeId);

    expect(service.doGet).toHaveBeenCalledWith(
      expect.stringContaining(`/products/attributes/${attributeId}/terms`)
    );
    expect(result.data).toEqual(mockData);
    expect(result.error).toBeNull();
  });

  it('should list attribute terms with query params', async () => {
    const attributeId = 15;
    const params: ProductAttributeTermRequest = {
      id: 3,
      order: 'asc',
      orderby: 'name',
    };
    const mockData = [{ id: 3, name: 'Small' }] as ProductAttributeResponse[];
    service.doGet.mockResolvedValue({ data: mockData, error: null });

    const result = await service.list(attributeId, params);

    expect(service.doGet).toHaveBeenCalledWith(
      expect.stringContaining(`id=3&order=asc&orderby=name`)
    );
    expect(service.doGet).toHaveBeenCalledWith(
      expect.stringContaining(`/products/attributes/${attributeId}/terms`)
    );
    expect(result.data).toEqual(mockData);
    expect(result.error).toBeNull();
  });
});
