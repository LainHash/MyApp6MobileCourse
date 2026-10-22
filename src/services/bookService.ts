import { Book, CreateBook, UpdateBook, Category } from "../types";
import { apiService } from "./apiService";

export const bookService = {
  async getBooks(params?: {
    search?: string;
    category_id?: number | null;
    status?: string | null;
    page?: number;
    limit?: number;
  }): Promise<{ books: Book[]; total: number }> {
    try {
      const { client, endpoints } = await apiService.getClient();
      const queryParams: Record<string, any> = {
        limit: params?.limit || 100,
        page: params?.page || 1,
      };
      if (params?.search) queryParams.search = params.search;
      if (params?.category_id) queryParams.category_id = params.category_id;
      if (params?.status) queryParams.status = params.status;

      const res = await client.get(endpoints.BOOKS_LIST, {
        params: queryParams,
      });
      const books: Book[] = res.data?.data || [];
      const total: number = res.data?.pagination?.total_items || books.length;
      return { books, total };
    } catch (err) {
      return apiService.handleError(err, "Không thể tải danh sách sách");
    }
  },

  async getBookDetail(id: number): Promise<Book> {
    try {
      const { client, endpoints } = await apiService.getClient();
      const res = await client.get(endpoints.BOOK_DETAIL, { params: { id } });
      if (!res.data?.data)
        throw new Error(res.data?.message || "Không tìm thấy thông tin sách");
      return res.data.data as Book;
    } catch (err) {
      return apiService.handleError(err, "Không thể tải chi tiết sách");
    }
  },

  async createBook(book: CreateBook): Promise<any> {
    try {
      const { client, endpoints } = await apiService.getClient();
      const res = await client.post(endpoints.BOOK_CREATE, book);
      if (res.data?.status === false) {
        throw new Error(res.data.message || "Thêm sách thất bại");
      }
      return res.data;
    } catch (err) {
      return apiService.handleError(err, "Không thể thêm sách mới");
    }
  },

  async updateBook(book: UpdateBook): Promise<any> {
    try {
      const { client, endpoints } = await apiService.getClient();
      const res = await client.post(endpoints.BOOK_UPDATE, book);
      if (res.data?.status === false) {
        throw new Error(res.data.message || "Cập nhật sách thất bại");
      }
      return res.data;
    } catch (err) {
      return apiService.handleError(err, "Không thể cập nhật sách");
    }
  },

  async deleteBook(id: number): Promise<any> {
    try {
      const { client, endpoints } = await apiService.getClient();
      const res = await client.post(endpoints.BOOK_DELETE, { id });
      if (res.data?.status === false) {
        throw new Error(res.data.message || "Xóa sách thất bại");
      }
      return res.data;
    } catch (err) {
      return apiService.handleError(err, "Không thể xóa sách");
    }
  },

  async getCategories(): Promise<Category[]> {
    try {
      const { client, endpoints } = await apiService.getClient();
      const res = await client.get(endpoints.CATEGORIES_LIST);
      return (res.data?.data || []) as Category[];
    } catch (err) {
      return apiService.handleError(err, "Không thể tải danh mục thể loại");
    }
  },
};
