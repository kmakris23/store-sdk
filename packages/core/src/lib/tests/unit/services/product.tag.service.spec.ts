import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
  afterEach,
  type MockedFunction,
} from 'vitest';
import { ProductTagService } from '../../../services/store/product.tag.service.js';
import {
  ProductTagResponse,
  ProductTagRequest,
} from '../../../types/store/index.js';
import { StoreSdkConfig } from '../../../configs/sdk.config.js';
import { StoreSdkState } from '../../../types/sdk.state.js';
import { EventBus } from '../../../bus/event.bus.js';
import { StoreSdkEvent } from '../../../sdk.events.js';
import { ApiError } from '../../../types/api.js';

vi.mock('../../../utilities/axios.utility.js', () => ({ doGet: vi.fn() }));
import { doGet } from '../../../utilities/axios.utility.js';

describe('ProductTagService', () => {
  let service: ProductTagService;
  let mockedGet: MockedFunction<typeof doGet>;
  const state: StoreSdkState = {};
  const config: StoreSdkConfig = { baseUrl: 'https://example.com' };
  const events = new EventBus<StoreSdkEvent>();

  const tag = (id: number, name: string): ProductTagResponse => ({
    id,
    name,
    slug: name.toLowerCase(),
    description: '',
    parent: 0,
    count: 0,
  });

  beforeEach(() => {
    mockedGet = doGet as unknown as MockedFunction<typeof doGet>;
    vi.clearAllMocks();
    service = new ProductTagService(state, config, events);
  });
  afterEach(() => vi.clearAllMocks());

  it('lists tags', async () => {
    mockedGet.mockResolvedValue({ data: [tag(1, 'Tag1'), tag(2, 'Tag2')] });
    const result = await service.list();
    expect(mockedGet).toHaveBeenCalledWith(
      '/wp-json/wc/store/v1/products/tags?'
    );
    expect(result.data?.length).toBe(2);
  });

  it('lists tags with params', async () => {
    const params: ProductTagRequest = { per_page: 10, page: 2 };
    mockedGet.mockResolvedValue({ data: [tag(3, 'Tag3')] });
    await service.list(params);
    const url = mockedGet.mock.calls[0][0];
    expect(url).toContain('per_page=10');
    expect(url).toContain('page=2');
  });

  it('handles list error', async () => {
    const error: ApiError = {
      code: 'error',
      message: 'Failure',
      data: { status: 500 },
      details: {},
    };
    mockedGet.mockResolvedValue({ error });
    const result = await service.list();
    expect(result.error).toEqual(error);
  });
});
