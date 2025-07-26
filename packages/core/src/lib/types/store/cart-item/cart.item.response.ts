import { ImageResponse } from '../image.response.js';
import { CartItemPriceResponse } from './cart.item.price.response.js';
import { CartItemQuantityLimitsResponse } from './cart.item.quantity.limits.response.js';
import { CartItemTotalResponse } from './cart.item.total.response.js';
import { CartItemVariationResponse } from './cart.item.variation.response.js';

export interface CartItemResponse {
  key: string;
  id: number;
  quantity: number;
  type: string;
  quantity_limits: CartItemQuantityLimitsResponse;
  name: string;
  short_description: string;
  description: string;
  sku: string;
  low_stock_remaining: number | null;
  backorders_allowed: boolean;
  show_backorder_badge: boolean;
  sold_individually: boolean;
  permalink: string;
  images: ImageResponse[];
  variation: CartItemVariationResponse[];
  item_data: unknown[];
  prices: CartItemPriceResponse;
  totals: CartItemTotalResponse;
  catalog_visibility: string;
  extensions: unknown;
}
