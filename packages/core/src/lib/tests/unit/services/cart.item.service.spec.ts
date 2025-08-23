import { describe, it, expect, beforeEach, vi, type MockedFunction } from 'vitest';
import { CartItemService } from '../../../services/store/cart.item.service.js';
import { CartItemAddRequest, CartItemResponse } from '../../../types/store/index.js';
import { StoreSdkConfig } from '../../../configs/sdk.config.js';
import { StoreSdkState } from '../../../types/sdk.state.js';
import { EventBus } from '../../../bus/event.bus.js';
import { StoreSdkEvent } from '../../../sdk.events.js';
import { ApiError } from '../../../types/api.js';

vi.mock('../../../utilities/axios.utility.js', () => ({ doGet: vi.fn(), doPost: vi.fn(), doPut: vi.fn(), doDelete: vi.fn() }));
import { doGet, doPost, doPut, doDelete } from '../../../utilities/axios.utility.js';

describe('CartItemService', () => {
  let service: CartItemService;
  let mockedGet: MockedFunction<typeof doGet>;
  let mockedPost: MockedFunction<typeof doPost>;
  let mockedPut: MockedFunction<typeof doPut>;
  let mockedDelete: MockedFunction<typeof doDelete>;
  const state: StoreSdkState = {};
  const config: StoreSdkConfig = { baseUrl: 'https://example.com' };
  const events = new EventBus<StoreSdkEvent>();

  const item = (key: string): CartItemResponse => ({ key } as unknown as CartItemResponse);

  beforeEach(() => {
    mockedGet = doGet as unknown as MockedFunction<typeof doGet>;
    mockedPost = doPost as unknown as MockedFunction<typeof doPost>;
    mockedPut = doPut as unknown as MockedFunction<typeof doPut>;
    mockedDelete = doDelete as unknown as MockedFunction<typeof doDelete>;
    vi.clearAllMocks();
    service = new CartItemService(state, config, events);
  });

  it('lists items', async () => {
    mockedGet.mockResolvedValue({ data: [item('abc')] });
    const result = await service.list();
    expect(mockedGet).toHaveBeenCalledWith('/wp-json/wc/store/v1/cart/items', expect.any(Object));
    expect(result.data?.length).toBe(1);
  });

  it('gets single item', async () => {
    mockedGet.mockResolvedValue({ data: item('k1') });
    await service.single('k1');
    expect(mockedGet.mock.calls[0][0]).toBe('/wp-json/wc/store/v1/cart/items/k1');
  });

  it('adds item and emits events', async () => {
    mockedPost.mockResolvedValue({ data: item('k2') });
    await service.add({ id: 1, quantity: 2 } as CartItemAddRequest);
    expect(mockedPost.mock.calls[0][0]).toContain('/wp-json/wc/store/v1/cart/items?');
  });

  it('updates item', async () => {
    mockedPut.mockResolvedValue({ data: item('k3') });
    await service.update('k3', 5);
    expect(mockedPut.mock.calls[0][0]).toContain('/wp-json/wc/store/v1/cart/items/k3?');
  });

  it('removes item', async () => {
    mockedDelete.mockResolvedValue({ data: { ok: true } });
    await service.remove('k4');
    expect(mockedDelete.mock.calls[0][0]).toBe('/wp-json/wc/store/v1/cart/items/k4');
  });

  it('clears items', async () => {
    mockedDelete.mockResolvedValue({ data: [] });
    await service.clear();
    expect(mockedDelete.mock.calls[0][0]).toBe('/wp-json/wc/store/v1/cart/items');
  });

  it('handles error on list', async () => {
    const error: ApiError = { code: 'err', message: 'fail', data: { status:500 }, details: {} };
    mockedGet.mockResolvedValue({ error });
    const result = await service.list();
    expect(result.error).toEqual(error);
  });
});
