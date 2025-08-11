import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProductReviewService } from '../../../services/store/product.review.service.js';
import {
  ProductReviewRequest,
  ProductReviewResponse,
} from '../../../types/store/index.js';
import { StoreSdkEventEmitter } from '../../../sdk.event.emitter.js';
import { StoreSdkConfig } from '../../../configs/sdk.config.js';
import { StoreSdkState } from '../../../types/sdk.state.js';

class MockProductReviewService extends ProductReviewService {
  doGet = vi.fn();
}

describe('ProductReviewService', () => {
  let service: MockProductReviewService;
  const state: StoreSdkState = {};
  const config: StoreSdkConfig = {
    baseUrl: 'https://example.com',
  };
  const events = new StoreSdkEventEmitter();

  beforeEach(() => {
    service = new MockProductReviewService(state, config, events);
  });

  it('should list product reviews without params', async () => {
    const mockData = [
      { id: 1, product_id: 101, review: 'Great!' },
      { id: 2, product_id: 102, review: 'Good' },
    ] as ProductReviewResponse[];

    service.doGet.mockResolvedValue({ data: mockData, error: null });

    const result = await service.list();

    expect(service.doGet).toHaveBeenCalledWith(
      expect.stringContaining('/products/reviews?')
    );
    expect(result.data).toEqual(mockData);
    expect(result.error).toBeNull();
  });

  it('should list product reviews with query params', async () => {
    const params: ProductReviewRequest = { product_id: '101', per_page: 5 };
    const mockData = [
      { id: 3, product_id: 101, review: 'Awesome!' },
    ] as ProductReviewResponse[];

    service.doGet.mockResolvedValue({ data: mockData, error: null });

    const result = await service.list(params);

    expect(service.doGet).toHaveBeenCalledWith(
      expect.stringContaining('product_id=101')
    );
    expect(service.doGet).toHaveBeenCalledWith(
      expect.stringContaining('per_page=5')
    );
    expect(result.data).toEqual(mockData);
  });
});
