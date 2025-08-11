import { ImageResponse } from '../image.response.js';

export interface ProductCategoryResponse {
  id: number;
  name: string;
  slug: string;
  description: string;
  parent: number;
  count: number;
  image: ImageResponse | null;
  review_count: number;
  permalink: string;
}
