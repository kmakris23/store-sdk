import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import qs from 'qs';
import { ProductReviewService } from '../../lib/services/store/product.review.service';
import { ProductReviewRequest } from '../../lib/types/store/product-review/product.review.request';
import { ProductReviewResponse } from '../../lib/types/store/product-review/product.review.response';

vi.mock('axios');

describe('ProductReviewService', () => {
  const baseUrl = 'https://example.com';
  let service: ProductReviewService;
  let axiosMockInstance: any;

  beforeEach(() => {
    axiosMockInstance = { get: vi.fn() };
    axios.create = vi.fn(() => axiosMockInstance);
    service = new ProductReviewService(baseUrl);
  });

  it('should list product reviews with query params', async () => {
    const params: ProductReviewRequest = {};

    const mockResponse: ProductReviewResponse[] = [];

    axiosMockInstance.get.mockResolvedValue(mockResponse);

    const result = await service.list(params);
    const expectedQuery = qs.stringify(params, { encode: true });
    const expectedUrl = `${baseUrl}/wp-json/wc/store/v1/products/reviews?${expectedQuery}`;

    expect(axiosMockInstance.get).toHaveBeenCalledWith(expectedUrl);
    expect(result).toEqual(mockResponse);
  });

  it('should list product reviews without params', async () => {
    const mockResponse: ProductReviewResponse[] = [];

    axiosMockInstance.get.mockResolvedValue(mockResponse);

    const result = await service.list();

    expect(axiosMockInstance.get).toHaveBeenCalledWith(
      `${baseUrl}/wp-json/wc/store/v1/products/reviews?`
    );
    expect(result).toEqual(mockResponse);
  });
});
