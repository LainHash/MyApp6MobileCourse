export interface Book {
  id: number;
  title: string;
  author: string;
  category_id: number;
  category_name: string;
  category_icon: string;
  isbn: string;
  publisher: string;
  publish_year: number;
  total_copies: number;
  available_copies: number;
  borrowed_copies: number;
  image_url: string;
  description: string;
  location: string;
  price: string;
  created_at: string;
  total_borrow_count: number;
}

export interface CreateBook {
  title: string;
  author: string;
  category_id: number;
  isbn?: string;
  publisher?: string;
  publish_year?: number;
  total_copies: number;
  image_url?: string;
  description?: string;
  location?: string;
  price?: string | number;
}

export interface UpdateBook {
  id: number;
  title: string;
  author: string;
  category_id: number;
  isbn?: string;
  publisher?: string;
  publish_year?: number;
  total_copies: number;
  image_url?: string;
  description?: string;
  location?: string;
  price?: string | number;
}
