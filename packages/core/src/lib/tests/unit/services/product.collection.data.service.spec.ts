import { describe, it, expect, beforeEach, vi, afterEach, type MockedFunction } from 'vitest';
import { ProductCollectionDataService } from '../../../services/store/product.collection.data.service.js';
import { ProductCollectionDataResponse, ProductCollectionDataRequest } from '../../../types/store/index.js';
import { StoreSdkConfig } from '../../../configs/sdk.config.js';
import { StoreSdkState } from '../../../types/sdk.state.js';
import { EventBus } from '../../../bus/event.bus.js';
import { StoreSdkEvent } from '../../../sdk.events.js';
import { ApiError } from '../../../types/api.js';

vi.mock('../../../utilities/axios.utility.js', () => ({ doGet: vi.fn() }));
import { doGet } from '../../../utilities/axios.utility.js';

describe('ProductCollectionDataService', () => {
  let service: ProductCollectionDataService;
  let mockedGet: MockedFunction<typeof doGet>;
  const state: StoreSdkState = {};
  const config: StoreSdkConfig = { baseUrl: 'https://example.com' };
  const events = new EventBus<StoreSdkEvent>();

  const response = (): ProductCollectionDataResponse => ({
    price_range: {
      min_price: '0',
      max_price: '100',
      currency_code: 'USD',
  currency_decimal_separator: '.',
  currency_minor_unit: 2,
  currency_prefix: '$',
  currency_suffix: '',
  currency_symbol: '$',
  currency_thousand_separator: ',',
    },
    attribute_counts: [],
    rating_counts: [],
    taxonomy_counts: [],
  });

  beforeEach(() => {
    mockedGet = doGet as unknown as MockedFunction<typeof doGet>;
    vi.clearAllMocks();
    service = new ProductCollectionDataService(state, config, events);
  });
  afterEach(() => vi.clearAllMocks());

  it('calculates collection data without params', async () => {
    mockedGet.mockResolvedValue({ data: response() });
    const result = await service.calculate();
    expect(mockedGet).toHaveBeenCalledWith('/wp-json/wc/store/v1/products/collection-data?');
    expect(result.data?.price_range.min_price).toBe('0');
  });

  it('calculates with params and serializes query', async () => {
    const params: ProductCollectionDataRequest = {
      calculate_price_range: true,
      calculate_rating_counts: true,
      calculate_taxonomy_counts: ['product_cat'],
    };
    mockedGet.mockResolvedValue({ data: response() });
    await service.calculate(params);
    const url = mockedGet.mock.calls[0][0];
    expect(url).toContain('calculate_price_range=true');
  });

  it('handles error path', async () => {
    const error: ApiError = { code: 'err', message: 'failure', data: { status:500 }, details: {} };
    mockedGet.mockResolvedValue({ error });
    const result = await service.calculate();
    expect(result.error).toEqual(error);
  });
});
