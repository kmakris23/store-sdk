import { ImageResponse } from '../image.response';

export interface ProductReviewResponse {
  id: number;
  date_created: string;
  formatted_date_created: string;
  date_created_gmt: string;
  product_id: number;
  product_name: string;
  product_permalink: string;
  product_image: ImageResponse;
  reviewer: string;
  review: string;
  rating: number;
  verified: boolean;
  reviewer_avatar_urls: { [key: string]: string }[];
}
