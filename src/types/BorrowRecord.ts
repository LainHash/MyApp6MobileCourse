import { BorrowItem } from "./BorrowItem";

export interface BorrowRecord {
  id: number;
  borrow_code: string;
  reader_id: number;
  reader_name: string;
  reader_card_number: string;
  reader_phone: string;
  reader_avatar: string;
  borrow_date: string;
  due_date: string;
  return_date: string | null;
  status: "borrowing" | "returned" | "overdue";
  days_overdue: number;
  notes: string | null;
  fine_amount: string;
  created_by: string;
  total_titles: number;
  total_books_count: string;
  items?: BorrowItem[];
}

export interface CreateBorrowRecord {
  reader_id: number;
  books: { book_id: number; quantity?: number; condition_note?: string }[];
  due_date: string;
  notes?: string;
  created_by?: string;
}

export interface ReturnBorrow {
  borrow_id: number;
  fine_amount?: number;
  condition_note?: string;
}

export interface RenewBorrow {
  borrow_id: number;
  extra_days?: number;
}
