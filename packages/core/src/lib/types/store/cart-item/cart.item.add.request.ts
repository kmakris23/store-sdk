export interface CartItemAddRequest {
  id: number;
  quantity: number;
  variation: { [key: string]: string }[];
}
