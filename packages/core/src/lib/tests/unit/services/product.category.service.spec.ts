import { describe, it, expect, beforeEach, vi, afterEach, type MockedFunction } from 'vitest';
import { ProductCategoryService } from '../../../services/store/product.category.service.js';
import { ProductCategoryResponse, ProductCategoryRequest } from '../../../types/store/index.js';
import { StoreSdkConfig } from '../../../configs/sdk.config.js';
import { StoreSdkState } from '../../../types/sdk.state.js';
import { EventBus } from '../../../bus/event.bus.js';
import { StoreSdkEvent } from '../../../sdk.events.js';
import { ApiError } from '../../../types/api.js';

vi.mock('../../../utilities/axios.utility.js', () => ({ doGet: vi.fn() }));
import { doGet } from '../../../utilities/axios.utility.js';

describe('ProductCategoryService', () => {
  let service: ProductCategoryService;
  let mockedGet: MockedFunction<typeof doGet>;
  const state: StoreSdkState = {};
  const config: StoreSdkConfig = { baseUrl: 'https://example.com' };
  const events = new EventBus<StoreSdkEvent>();

  const category = (id: number, name: string): ProductCategoryResponse => ({
    id,
    name,
    slug: name.toLowerCase(),
    parent: 0,
    description: '',
    image: null,
    count: 0,
    review_count: 0,
    permalink: `https://example.com/cat/${name.toLowerCase()}`,
  });

  beforeEach(() => {
    mockedGet = doGet as unknown as MockedFunction<typeof doGet>;
    vi.clearAllMocks();
    service = new ProductCategoryService(state, config, events);
  });
  afterEach(() => vi.clearAllMocks());

  it('lists categories and parses headers', async () => {
    mockedGet.mockResolvedValue({ data: [category(1,'Clothing')], headers: { 'x-wp-total': 1, 'x-wp-totalpages': 1 } });
    const result = await service.list();
    expect(mockedGet).toHaveBeenCalledWith('/wp-json/wc/store/v1/products/categories?');
    expect(result.total).toBe(1);
  });

  it('lists categories with params', async () => {
    const params: ProductCategoryRequest = { per_page: 5, page: 1 };
    mockedGet.mockResolvedValue({ data: [category(3,'Shoes')] });
    await service.list(params);
    const url = mockedGet.mock.calls[0][0];
    expect(url).toContain('per_page=5');
    expect(url).toContain('page=1');
  });

  it('gets single category', async () => {
    const data = category(10,'Hats');
    mockedGet.mockResolvedValue({ data });
    const result = await service.single(10);
    expect(mockedGet).toHaveBeenCalledWith('/wp-json/wc/store/v1/products/categories/10');
    expect(result.data).toEqual(data);
  });

  it('single category error path', async () => {
    const error: ApiError = { code: 'not_found', message: 'Missing', data: { status:404 }, details: {} };
    mockedGet.mockResolvedValue({ error });
    const result = await service.single(999);
    expect(result.error).toEqual(error);
  });
});
