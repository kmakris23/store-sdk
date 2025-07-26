import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { ProductAttributeService } from '../../lib/services/store/product.attribute.service';

vi.mock('axios');

describe('ProductAttributeService', () => {
  const baseUrl = 'https://example.com';
  let service: ProductAttributeService;
  let axiosMockInstance: any;

  beforeEach(() => {
    axiosMockInstance = {
      get: vi.fn(),
    };

    axios.create = vi.fn(() => axiosMockInstance);
    service = new ProductAttributeService(baseUrl);
  });

  it('should list product attributes', async () => {
    const mockResponse = [
      { id: 1, name: 'Color' },
      { id: 2, name: 'Size' },
    ];
    axiosMockInstance.get.mockResolvedValue(mockResponse);

    const result = await service.list();
    expect(axiosMockInstance.get).toHaveBeenCalledWith(
      `${baseUrl}/wp-json/wc/store/v1/products/attributes`
    );
    expect(result).toEqual(mockResponse);
  });

  it('should get a single product attribute', async () => {
    const id = 5;
    const mockResponse = { id: 5, name: 'Material' };
    axiosMockInstance.get.mockResolvedValue(mockResponse);

    const result = await service.single(id);
    expect(axiosMockInstance.get).toHaveBeenCalledWith(
      `${baseUrl}/wp-json/wc/store/v1/products/attributes/${id}`
    );
    expect(result).toEqual(mockResponse);
  });
});
