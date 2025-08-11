import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProductTagService } from '../../../services/store/product.tag.service.js';
import {
  ProductTagResponse,
  ProductTagRequest,
} from '../../../types/store/index.js';
import { StoreSdkEventEmitter } from '../../../sdk.event.emitter.js';
import { StoreSdkConfig } from '../../../configs/sdk.config.js';
import { StoreSdkState } from '../../../types/sdk.state.js';

class MockProductTagService extends ProductTagService {
  doGet = vi.fn();
}

describe('ProductTagService', () => {
  let service: MockProductTagService;
  const state: StoreSdkState = {};
  const config: StoreSdkConfig = {
    baseUrl: 'https://example.com',
  };
  const events = new StoreSdkEventEmitter();

  beforeEach(() => {
    service = new MockProductTagService(state, config, events);
  });

  it('should list product tags without params', async () => {
    const mockData = [
      { id: 1, name: 'Tag1' },
      { id: 2, name: 'Tag2' },
    ] as ProductTagResponse[];

    service.doGet.mockResolvedValue({ data: mockData, error: null });

    const result = await service.list();

    expect(service.doGet).toHaveBeenCalledWith(
      expect.stringContaining('/products/tags?')
    );
    expect(result.data).toEqual(mockData);
    expect(result.error).toBeNull();
  });

  it('should list product tags with query params', async () => {
    const params: ProductTagRequest = { per_page: 10, page: 2 };
    const mockData = [{ id: 3, name: 'Tag3' }] as ProductTagResponse[];

    service.doGet.mockResolvedValue({ data: mockData, error: null });

    const result = await service.list(params);

    expect(service.doGet).toHaveBeenCalledWith(
      expect.stringContaining('per_page=10&page=2')
    );
    expect(result.data).toEqual(mockData);
  });
});
