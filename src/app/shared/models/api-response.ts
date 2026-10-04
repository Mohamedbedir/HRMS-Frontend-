export interface ApiResponse<T> {
  statusCode: string;
  meta: string | null;
  succeeded: boolean;
  message: string | null;
  errors: string[] | null;
  data: T;
}