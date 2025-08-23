import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
  afterEach,
  type MockedFunction,
} from 'vitest';
import { ProductAttributeService } from '../../../services/store/product.attribute.service.js';
import { ProductAttributeResponse } from '../../../types/store/index.js';
import { StoreSdkConfig } from '../../../configs/sdk.config.js';
import { StoreSdkState } from '../../../types/sdk.state.js';
import { EventBus } from '../../../bus/event.bus.js';
import { StoreSdkEvent } from '../../../sdk.events.js';
import { ApiError } from '../../../types/api.js';

vi.mock('../../../utilities/axios.utility.js', () => ({ doGet: vi.fn() }));
import { doGet } from '../../../utilities/axios.utility.js';

describe('ProductAttributeService', () => {
  let service: ProductAttributeService;
  let mockedGet: MockedFunction<typeof doGet>;
  const state: StoreSdkState = {};
  const config: StoreSdkConfig = { baseUrl: 'https://example.com' };
  const events = new EventBus<StoreSdkEvent>();

  const attr = (id: number, name: string): ProductAttributeResponse => ({
    id,
    name,
    taxonomy: `pa_${name.toLowerCase()}`,
    type: 'select',
    order: 'menu_order',
    has_archives: false,
  });

  beforeEach(() => {
    mockedGet = doGet as unknown as MockedFunction<typeof doGet>;
    vi.clearAllMocks();
    service = new ProductAttributeService(state, config, events);
  });
  afterEach(() => vi.clearAllMocks());

  it('lists attributes with headers', async () => {
    mockedGet.mockResolvedValue({
      data: [attr(1, 'Color')],
      headers: { 'x-wp-total': 1, 'x-wp-totalpages': 1 },
    });
    const result = await service.list();
    expect(mockedGet).toHaveBeenCalledWith(
      '/wp-json/wc/store/v1/products/attributes'
    );
    expect(result.total).toBe(1);
  });

  it('gets single attribute', async () => {
    mockedGet.mockResolvedValue({ data: attr(5, 'Size') });
    const result = await service.single(5);
    expect(mockedGet).toHaveBeenCalledWith(
      '/wp-json/wc/store/v1/products/attributes/5'
    );
    expect(result.data?.name).toBe('Size');
  });

  it('single attribute error', async () => {
    const error: ApiError = {
      code: 'not_found',
      message: 'Missing',
      data: { status: 404 },
      details: {},
    };
    mockedGet.mockResolvedValue({ error });
    const result = await service.single(999);
    expect(result.error).toEqual(error);
  });
});
