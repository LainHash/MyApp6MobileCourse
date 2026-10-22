export interface User {
  id: number;
  username: string;
  full_name: string;
  role: "admin" | "librarian";
  email?: string | null;
  phone?: string | null;
  avatar?: string | null;
  status?: "active" | "inactive";
  token?: string;
  created_at?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  full_name: string;
  email?: string;
  phone?: string;
  role?: "admin" | "librarian";
}

export interface AuthResponse {
  status: boolean;
  code: number;
  message: string;
  data?: User;
}
