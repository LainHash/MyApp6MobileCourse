export const DEFAULT_API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  "http://10.0.2.2:8082/Mobile_CuoiKy_Api";

export const formatBaseUrl = (url?: string): string => {
  if (!url) return `${DEFAULT_API_BASE_URL.replace(/\/+$/, "")}/api`;
  let trimmed = url.trim().replace(/\/+$/, "");
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    trimmed = `http://${trimmed}`;
  }
  // Ensure /api suffix
  if (!trimmed.endsWith("/api")) {
    trimmed = `${trimmed}/api`;
  }
  return trimmed;
};

export const createEndpoints = (baseUrl: string = DEFAULT_API_BASE_URL) => {
  const cleanBase = formatBaseUrl(baseUrl);
  return {
    BASE: cleanBase,
    BOOKS_LIST: `${cleanBase}/books/read.php`,
    BOOK_DETAIL: `${cleanBase}/books/read_one.php`,
    BOOK_SEARCH: `${cleanBase}/books/search.php`,
    BOOK_CREATE: `${cleanBase}/books/create.php`,
    BOOK_UPDATE: `${cleanBase}/books/update.php`,
    BOOK_DELETE: `${cleanBase}/books/delete.php`,

    CATEGORIES_LIST: `${cleanBase}/categories/read.php`,

    READERS_LIST: `${cleanBase}/readers/read.php`,
    READER_DETAIL: `${cleanBase}/readers/read_one.php`,
    READER_CREATE: `${cleanBase}/readers/create.php`,
    READER_UPDATE: `${cleanBase}/readers/update.php`,
    READER_DELETE: `${cleanBase}/readers/delete.php`,

    BORROWS_LIST: `${cleanBase}/borrows/read.php`,
    BORROW_DETAIL: `${cleanBase}/borrows/read_one.php`,
    BORROW_HISTORY: `${cleanBase}/borrows/history.php`,
    BORROW_CREATE: `${cleanBase}/borrows/create.php`,
    BORROW_RETURN: `${cleanBase}/borrows/return_book.php`,
    BORROW_RENEW: `${cleanBase}/borrows/renew.php`,

    STATS_DASHBOARD: `${cleanBase}/stats/dashboard.php`,

    AUTH_LOGIN: `${cleanBase}/auth/login.php`,
    AUTH_REGISTER: `${cleanBase}/auth/register.php`,
    AUTH_ME: `${cleanBase}/auth/me.php`,
  };
};

export const API_ENDPOINTS = createEndpoints(DEFAULT_API_BASE_URL);
