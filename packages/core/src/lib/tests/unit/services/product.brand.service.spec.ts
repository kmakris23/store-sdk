import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
  afterEach,
  type MockedFunction,
} from 'vitest';
import { ProductBrandService } from '../../../services/store/product.brand.service.js';
import { ProductBrandResponse } from '../../../types/store/index.js';
import { Paginated } from '../../../types/store/paginated.js';
import { StoreSdkConfig } from '../../../configs/sdk.config.js';
import { StoreSdkState } from '../../../types/sdk.state.js';
import { EventBus } from '../../../bus/event.bus.js';
import { StoreSdkEvent } from '../../../sdk.events.js';
import { ApiError } from '../../../types/api.js';

vi.mock('../../../utilities/axios.utility.js', () => ({ doGet: vi.fn() }));
import { doGet } from '../../../utilities/axios.utility.js';

describe('ProductBrandService', () => {
  let service: ProductBrandService;
  let mockedGet: MockedFunction<typeof doGet>;
  const state: StoreSdkState = {};
  const config: StoreSdkConfig = { baseUrl: 'https://example.com' };
  const events = new EventBus<StoreSdkEvent>();

  const brand = (id: number, name: string): ProductBrandResponse => ({
    id,
    name,
    slug: name.toLowerCase(),
    parent: 0,
    description: '',
    image: null,
    count: 0,
    review_count: 0,
    permalink: `https://example.com/brand/${name.toLowerCase()}`,
  });

  beforeEach(() => {
    mockedGet = doGet as unknown as MockedFunction<typeof doGet>;
    vi.clearAllMocks();
    service = new ProductBrandService(state, config, events);
  });
  afterEach(() => vi.clearAllMocks());

  it('lists brands and parses headers', async () => {
    const data = [brand(1, 'Nike'), brand(2, 'Adidas')];
    mockedGet.mockResolvedValue({
      data,
      headers: { 'x-wp-total': 2, 'x-wp-totalpages': 1 },
    });
    const result = await service.list();
    expect(mockedGet).toHaveBeenCalledWith(
      '/wp-json/wc/store/v1/products/brands?'
    );
    expect(result.data).toEqual(data);
    expect(result.total).toBe(2);
  });

  it('lists brands with pagination params', async () => {
    const params: Paginated = { page: 2, per_page: 10 };
    const data = [brand(3, 'Puma')];
    mockedGet.mockResolvedValue({ data });
    await service.list(params);
    const url = mockedGet.mock.calls[0][0];
    expect(url).toContain('page=2');
    expect(url).toContain('per_page=10');
  });

  it('gets single brand', async () => {
    const data = brand(5, 'Reebok');
    mockedGet.mockResolvedValue({ data });
    const result = await service.single(5);
    expect(mockedGet).toHaveBeenCalledWith(
      '/wp-json/wc/store/v1/products/brands/5'
    );
    expect(result.data).toEqual(data);
  });

  it('single brand error path', async () => {
    const error: ApiError = {
      code: 'not_found',
      message: 'Missing',
      data: { status: 404 },
      details: {},
    };
    mockedGet.mockResolvedValue({ error });
    const result = await service.single(9999);
    expect(result.error).toEqual(error);
    expect(result.data).toBeUndefined();
  });
});
