import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
  afterEach,
  type MockedFunction,
} from 'vitest';
import { ProductReviewService } from '../../../services/store/product.review.service.js';
import {
  ProductReviewRequest,
  ProductReviewResponse,
} from '../../../types/store/index.js';
import { StoreSdkConfig } from '../../../configs/sdk.config.js';
import { StoreSdkState } from '../../../types/sdk.state.js';
import { EventBus } from '../../../bus/event.bus.js';
import { StoreSdkEvent } from '../../../sdk.events.js';
import { ApiError } from '../../../types/api.js';

vi.mock('../../../utilities/axios.utility.js', () => ({ doGet: vi.fn() }));
import { doGet } from '../../../utilities/axios.utility.js';

describe('ProductReviewService', () => {
  let service: ProductReviewService;
  let mockedGet: MockedFunction<typeof doGet>;
  const state: StoreSdkState = {};
  const config: StoreSdkConfig = { baseUrl: 'https://example.com' };
  const events = new EventBus<StoreSdkEvent>();

  const review = (
    id: number,
    product_id: number,
    text: string
  ): ProductReviewResponse => ({
    id,
    product_id,
    date_created: '',
    formatted_date_created: '',
    date_created_gmt: '',
    product_name: '',
    product_permalink: '',
    product_image: { id: 0, src: '', thumbnail: '', name: '' } as any,
    reviewer: 'Anon',
    review: text,
    rating: 0,
    verified: false,
    reviewer_avatar_urls: [],
  });

  beforeEach(() => {
    mockedGet = doGet as unknown as MockedFunction<typeof doGet>;
    vi.clearAllMocks();
    service = new ProductReviewService(state, config, events);
  });
  afterEach(() => vi.clearAllMocks());

  it('lists reviews and parses headers', async () => {
    const data = [review(1, 101, 'Great!'), review(2, 102, 'Ok')];
    mockedGet.mockResolvedValue({
      data,
      headers: { 'x-wp-total': 2, 'x-wp-totalpages': 1 },
    });
    const result = await service.list();
    expect(mockedGet).toHaveBeenCalledWith(
      '/wp-json/wc/store/v1/products/reviews?'
    );
    expect(result.total).toBe(2);
  });

  it('lists with params', async () => {
    const params: ProductReviewRequest = { product_id: '101', per_page: 5 };
    mockedGet.mockResolvedValue({ data: [review(3, 101, 'Awesome!')] });
    await service.list(params);
    const url = mockedGet.mock.calls[0][0];
    expect(url).toContain('product_id=101');
    expect(url).toContain('per_page=5');
  });

  it('list error path', async () => {
    const error: ApiError = {
      code: 'err',
      message: 'fail',
      data: { status: 500 },
      details: {},
    };
    mockedGet.mockResolvedValue({ error });
    const result = await service.list();
    expect(result.error).toEqual(error);
  });
});
