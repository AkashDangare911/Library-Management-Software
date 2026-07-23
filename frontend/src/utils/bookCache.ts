export interface Book {
  id: number;
  title: string;
  author: string;
  total_copies: number;
  available_copies: number;
}

export let cachedBooks: Book[] | null = null;

export const setCachedBooks = (books: Book[]) => {
  cachedBooks = books;
};
