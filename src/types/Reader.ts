export interface Reader {
  id: number;
  card_number: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  status: "active" | "expired" | "locked";
  expiry_date: string;
  avatar: string;
}

export interface CreateReader {
  name: string;
  phone: string;
  email?: string;
  card_number?: string;
  gender?: string;
  birth_date?: string;
  address?: string;
  expiry_date: string;
  avatar?: string;
  status?: string;
}

export interface UpdateReader {
  id: number;
  name: string;
  phone: string;
  email?: string;
  card_number?: string;
  gender?: string;
  birth_date?: string;
  address?: string;
  expiry_date: string;
  avatar?: string;
  status?: string;
}
