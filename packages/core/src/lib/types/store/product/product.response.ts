import { ImageResponse } from '../image.response';
import { ProductPriceResponse } from './product.price.response';

export interface ProductResponse {
  id: number;
  name: string;
  slug: string;
  variation: string;
  permalink: string;
  sku: string;
  summary: string;
  short_description: string;
  description: string;
  on_sale: boolean;
  prices: ProductPriceResponse;
  average_rating: string;
  review_count: number;
  images: ImageResponse[];
  has_options: boolean;
  is_purchasable: boolean;
  is_in_stock: boolean;
  low_stock_remaining: unknown;
  add_to_cart: {
    text: string;
    description: string;
  };
}
