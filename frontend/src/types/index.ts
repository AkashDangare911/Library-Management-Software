export interface User {
  id: number;
  name: string;
  email: string;
  role: 'member' | 'librarian' | 'admin';
  created_at: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  category: string;
  description: string;
  published_date: string;
  total_copies: number;
  available_copies: number;
  created_at: string;
  updated_at: string;
}

export interface Borrowing {
  id: number;
  user_id: number;
  book_id: number;
  borrow_date: string;
  return_date: string | null;
  status: 'pending' | 'accepted' | 'issued' | 'returned' | 'rejected' | 'revoked' | 'overdue';
  penalty_amount: string | number;
  user_name?: string;
  user_email?: string;
  book_title?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalTitles: number;
  totalCopies: number;
  issuedBooks: number;
  totalRevenue: number | string;
}

export interface AppSettings {
  daily_penalty_amount?: string | number;
  reservation_duration_hours?: string | number;
  borrow_duration_days?: string | number;
}
