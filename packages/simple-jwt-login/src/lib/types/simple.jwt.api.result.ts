export interface SimpleJwtApiResult<T> {
  id?: number;
  data: T;
  roles?: string[];
  success: boolean;
  message?: string;
}
