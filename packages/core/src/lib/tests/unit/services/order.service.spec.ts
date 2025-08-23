import { describe, it, expect, beforeEach, vi, type MockedFunction } from 'vitest';
import { OrderService } from '../../../services/store/order.service.js';
import { OrderResponse } from '../../../types/store/index.js';
import { StoreSdkConfig } from '../../../configs/sdk.config.js';
import { StoreSdkState } from '../../../types/sdk.state.js';
import { EventBus } from '../../../bus/event.bus.js';
import { StoreSdkEvent } from '../../../sdk.events.js';
import { ApiError } from '../../../types/api.js';

vi.mock('../../../utilities/axios.utility.js', () => ({ doGet: vi.fn() }));
import { doGet } from '../../../utilities/axios.utility.js';

describe('OrderService', () => {
  let service: OrderService;
  let mockedGet: MockedFunction<typeof doGet>;
  const state: StoreSdkState = {};
  const config: StoreSdkConfig = { baseUrl: 'https://example.com' };
  const events = new EventBus<StoreSdkEvent>();

  const order = (id: number): OrderResponse => ({ id } as unknown as OrderResponse);

  beforeEach(() => {
    mockedGet = doGet as unknown as MockedFunction<typeof doGet>;
    vi.clearAllMocks();
    service = new OrderService(state, config, events);
  });

  it('gets order with billing email', async () => {
    mockedGet.mockResolvedValue({ data: order(123) });
    const result = await service.get('securekey', '123', 'test@example.com');
    const url = mockedGet.mock.calls[0][0];
    expect(url).toContain('/wp-json/wc/store/v1/order/123?');
    expect(url).toContain('key=securekey');
  // Email not encoded (service doesn't encode) so plain form expected
  expect(url).toContain('billing_email=test@example.com');
    expect(result.data?.id).toBe(123);
  });

  it('gets order without billing email', async () => {
    mockedGet.mockResolvedValue({ data: order(456) });
    const result = await service.get('securekey', '456');
    const url = mockedGet.mock.calls[0][0];
    expect(url).not.toContain('billing_email=');
    expect(result.data?.id).toBe(456);
  });

  it('handles error path', async () => {
    const error: ApiError = { code: 'not_found', message: 'missing', data: { status:404 }, details: {} };
    mockedGet.mockResolvedValue({ error });
    const result = await service.get('securekey', '999');
    expect(result.error).toEqual(error);
  });
});
