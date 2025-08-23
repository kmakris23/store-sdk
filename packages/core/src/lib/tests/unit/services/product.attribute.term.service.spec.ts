import { describe, it, expect, beforeEach, vi, afterEach, type MockedFunction } from 'vitest';
import { ProductAttributeTermService } from '../../../services/store/product.attribute.term.service.js';
import { ProductAttributeResponse, ProductAttributeTermRequest } from '../../../types/store/index.js';
import { StoreSdkConfig } from '../../../configs/sdk.config.js';
import { StoreSdkState } from '../../../types/sdk.state.js';
import { EventBus } from '../../../bus/event.bus.js';
import { StoreSdkEvent } from '../../../sdk.events.js';
import { ApiError } from '../../../types/api.js';

vi.mock('../../../utilities/axios.utility.js', () => ({ doGet: vi.fn() }));
import { doGet } from '../../../utilities/axios.utility.js';

describe('ProductAttributeTermService', () => {
  let service: ProductAttributeTermService;
  let mockedGet: MockedFunction<typeof doGet>;
  const state: StoreSdkState = {};
  const config: StoreSdkConfig = { baseUrl: 'https://example.com' };
  const events = new EventBus<StoreSdkEvent>();

  const term = (id: number, name: string): ProductAttributeResponse => ({
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
    service = new ProductAttributeTermService(state, config, events);
  });
  afterEach(() => vi.clearAllMocks());

  it('lists attribute terms without params and parses headers', async () => {
    const attributeId = 10;
    mockedGet.mockResolvedValue({ data: [term(1,'Red'), term(2,'Blue')], headers: { 'x-wp-total':2,'x-wp-totalpages':1 } });
    const result = await service.list(attributeId);
    expect(mockedGet).toHaveBeenCalledWith(`/wp-json/wc/store/v1/products/attributes/${attributeId}/terms?`);
    expect(result.total).toBe(2);
  });

  it('lists attribute terms with params', async () => {
    const attributeId = 15;
    const params: ProductAttributeTermRequest = { id: 3, order: 'asc', orderby: 'name' };
    mockedGet.mockResolvedValue({ data: [term(3,'Small')] });
    await service.list(attributeId, params);
    const url = mockedGet.mock.calls[0][0];
    expect(url).toContain('id=3');
    expect(url).toContain('order=asc');
    expect(url).toContain('orderby=name');
  });

  it('handles error path', async () => {
    const attributeId = 99;
    const error: ApiError = { code: 'not_found', message: 'Missing', data: { status:404 }, details: {} };
    mockedGet.mockResolvedValue({ error });
    const result = await service.list(attributeId);
    expect(result.error).toEqual(error);
  });
});
