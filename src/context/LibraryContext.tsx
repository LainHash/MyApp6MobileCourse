import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { Book, Reader, BorrowRecord, Category } from "../types";
import { apiService, DashboardStatsData } from "../services/apiService";
import { bookService } from "../services/bookService";
import { readerService } from "../services/readerService";
import { borrowService } from "../services/borrowService";

interface LibraryContextType {
  books: Book[];
  readers: Reader[];
  categories: Category[];
  borrows: BorrowRecord[];
  stats: DashboardStatsData | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  serverUrl: string;
  clearError: () => void;
  setServerUrl: (url: string) => Promise<boolean>;
  testConnection: (
    url?: string,
  ) => Promise<{ success: boolean; message: string }>;
  refreshAll: () => Promise<void>;
  fetchBooks: (params?: {
    search?: string;
    category_id?: number | null;
    status?: string | null;
  }) => Promise<void>;
  fetchReaders: (params?: {
    search?: string;
    status?: string | null;
  }) => Promise<void>;
  fetchBorrows: (params?: {
    search?: string;
    status?: string | null;
    reader_id?: number | null;
  }) => Promise<void>;
  createBook: (data: any) => Promise<any>;
  updateBook: (data: any) => Promise<any>;
  deleteBook: (id: number) => Promise<any>;
  createReader: (data: any) => Promise<any>;
  updateReader: (data: any) => Promise<any>;
  deleteReader: (id: number) => Promise<any>;
  createBorrow: (data: {
    reader_id: number;
    books: { book_id: number; quantity?: number; condition_note?: string }[];
    due_date: string;
    notes?: string;
    created_by?: string;
  }) => Promise<any>;
  returnBorrow: (data: {
    borrow_id: number;
    fine_amount?: number;
    condition_note?: string;
  }) => Promise<any>;
  renewBorrow: (data: {
    borrow_id: number;
    extra_days?: number;
  }) => Promise<any>;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export const LibraryProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [readers, setReaders] = useState<Reader[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [borrows, setBorrows] = useState<BorrowRecord[]>([]);
  const [stats, setStats] = useState<DashboardStatsData | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [serverUrl, setServerUrlState] = useState<string>("");

  const clearError = () => setError(null);

  const initUrl = async () => {
    const url = await apiService.getBaseUrl();
    setServerUrlState(url);
  };

  const fetchCategories = useCallback(async () => {
    try {
      const cats = await bookService.getCategories();
      setCategories(cats);
    } catch (e: any) {
      console.warn("Lỗi tải thể loại:", e.message);
    }
  }, []);

  const fetchBooks = useCallback(
    async (params?: {
      search?: string;
      category_id?: number | null;
      status?: string | null;
    }) => {
      try {
        const res = await bookService.getBooks(params);
        setBooks(res.books);
      } catch (e: any) {
        setError(e.message);
      }
    },
    [],
  );

  const fetchReaders = useCallback(
    async (params?: { search?: string; status?: string | null }) => {
      try {
        const res = await readerService.getReaders(params);
        setReaders(res.readers);
      } catch (e: any) {
        setError(e.message);
      }
    },
    [],
  );

  const fetchBorrows = useCallback(
    async (params?: {
      search?: string;
      status?: string | null;
      reader_id?: number | null;
    }) => {
      try {
        const res = await borrowService.getBorrows(params);
        setBorrows(res.borrows);
      } catch (e: any) {
        setError(e.message);
      }
    },
    [],
  );

  const fetchDashboardStats = useCallback(async () => {
    try {
      const data = await apiService.getDashboardStats();
      setStats(data);
    } catch (e: any) {
      console.warn("Lỗi tải thống kê:", e.message);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      await Promise.allSettled([
        fetchDashboardStats(),
        fetchBooks(),
        fetchCategories(),
        fetchReaders(),
        fetchBorrows(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [
    fetchDashboardStats,
    fetchBooks,
    fetchCategories,
    fetchReaders,
    fetchBorrows,
  ]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await initUrl();
      await refreshAll();
      setLoading(false);
    })();
  }, [refreshAll]);

  const handleSetServerUrl = async (url: string) => {
    const newUrl = await apiService.setBaseUrl(url);
    setServerUrlState(newUrl);
    await refreshAll();
    return true;
  };

  const handleTestConnection = async (url?: string) => {
    return await apiService.testConnection(url);
  };

  const handleCreateBook = async (data: any) => {
    const res = await bookService.createBook(data);
    await fetchBooks();
    await fetchDashboardStats();
    return res;
  };

  const handleUpdateBook = async (data: any) => {
    const res = await bookService.updateBook(data);
    await fetchBooks();
    await fetchDashboardStats();
    return res;
  };

  const handleDeleteBook = async (id: number) => {
    const res = await bookService.deleteBook(id);
    await fetchBooks();
    await fetchDashboardStats();
    return res;
  };

  const handleCreateReader = async (data: any) => {
    const res = await readerService.createReader(data);
    await fetchReaders();
    await fetchDashboardStats();
    return res;
  };

  const handleUpdateReader = async (data: any) => {
    const res = await readerService.updateReader(data);
    await fetchReaders();
    await fetchDashboardStats();
    return res;
  };

  const handleDeleteReader = async (id: number) => {
    const res = await readerService.deleteReader(id);
    await fetchReaders();
    await fetchDashboardStats();
    return res;
  };

  const handleCreateBorrow = async (data: any) => {
    const res = await borrowService.createBorrow(data);
    await fetchBorrows();
    await fetchBooks();
    await fetchDashboardStats();
    return res;
  };

  const handleReturnBorrow = async (data: any) => {
    const res = await borrowService.returnBorrow(data);
    await fetchBorrows();
    await fetchBooks();
    await fetchDashboardStats();
    return res;
  };

  const handleRenewBorrow = async (data: any) => {
    const res = await borrowService.renewBorrow(data);
    await fetchBorrows();
    return res;
  };

  return (
    <LibraryContext.Provider
      value={{
        books,
        readers,
        categories,
        borrows,
        stats,
        loading,
        refreshing,
        error,
        serverUrl,
        clearError,
        setServerUrl: handleSetServerUrl,
        testConnection: handleTestConnection,
        refreshAll,
        fetchBooks,
        fetchReaders,
        fetchBorrows,
        createBook: handleCreateBook,
        updateBook: handleUpdateBook,
        deleteBook: handleDeleteBook,
        createReader: handleCreateReader,
        updateReader: handleUpdateReader,
        deleteReader: handleDeleteReader,
        createBorrow: handleCreateBorrow,
        returnBorrow: handleReturnBorrow,
        renewBorrow: handleRenewBorrow,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = (): LibraryContextType => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error("useLibrary must be used within a LibraryProvider");
  }
  return context;
};
