export interface Book {
  id: number;
  title: string;
  author: string;
  total_copies: number;
  available_copies: number;
  isbn?: string;
  category?: string;
  rating?: number;
}

export interface PaginatedResponse {
  books: Book[];
  totalPages: number;
  totalItems: number;
  currentPage: number;
}

export const queryCache: Record<string, PaginatedResponse> = {};

export const setQueryCache = (queryString: string, data: PaginatedResponse) => {
  queryCache[queryString] = data;
};
