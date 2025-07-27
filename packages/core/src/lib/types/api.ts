export interface ApiError {
  code: string;
  message: string;
  data: {
    status: number;
    params?: Record<string, string>;
  };
  details: Record<string, Record<string, string>>;
}

export interface ApiData<T> {
  data: T;
}

export interface ApiResult<T> {
  data: T | null;
  error: ApiError | null;
}
