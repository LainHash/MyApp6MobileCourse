export interface Category {
  id: number;
  name: string;
  description?: string | null;
  icon?: string | null;
  book_count?: number;
  total_copies?: number;
  available_copies?: number;
  created_at?: string;
}
