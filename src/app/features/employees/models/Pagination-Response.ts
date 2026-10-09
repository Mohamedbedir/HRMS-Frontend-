export interface PaginationResponse<T> {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  meta: string | null;
  pageSize: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  messages: string[];
  data: T;
  succeeded: boolean;
}