export interface ErrorResponse {
  code: string;
  message: string;
  data: {
    status: number;
  };
}
