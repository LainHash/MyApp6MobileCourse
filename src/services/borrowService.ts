import {
  BorrowRecord,
  CreateBorrowRecord,
  ReturnBorrow,
  RenewBorrow,
} from "../types";
import { apiService } from "./apiService";

export const borrowService = {
  async getBorrows(params?: {
    search?: string;
    status?: string | null;
    reader_id?: number | null;
    page?: number;
    limit?: number;
  }): Promise<{ borrows: BorrowRecord[]; total: number }> {
    try {
      const { client, endpoints } = await apiService.getClient();
      const queryParams: Record<string, any> = {
        limit: params?.limit || 100,
        page: params?.page || 1,
      };
      if (params?.search) queryParams.search = params.search;
      if (params?.status && params.status !== "all")
        queryParams.status = params.status;
      if (params?.reader_id) queryParams.reader_id = params.reader_id;

      const res = await client.get(endpoints.BORROWS_LIST, {
        params: queryParams,
      });
      const borrows: BorrowRecord[] = res.data?.data || [];
      const total: number = res.data?.pagination?.total_items || borrows.length;
      return { borrows, total };
    } catch (err) {
      return apiService.handleError(err, "Không thể tải danh sách phiếu mượn");
    }
  },

  async getBorrowDetail(id: number): Promise<BorrowRecord> {
    try {
      const { client, endpoints } = await apiService.getClient();
      const res = await client.get(endpoints.BORROW_DETAIL, { params: { id } });
      if (!res.data?.data)
        throw new Error(res.data?.message || "Không tìm thấy phiếu mượn");
      return res.data.data as BorrowRecord;
    } catch (err) {
      return apiService.handleError(err, "Không thể tải chi tiết phiếu mượn");
    }
  },

  async getBorrowHistory(params?: {
    search?: string;
    status?: string | null;
    reader_id?: number | null;
    book_id?: number | null;
    page?: number;
    limit?: number;
  }): Promise<{ history: BorrowRecord[]; total: number }> {
    try {
      const { client, endpoints } = await apiService.getClient();
      const queryParams: Record<string, any> = {
        limit: params?.limit || 100,
        page: params?.page || 1,
      };
      if (params?.search) queryParams.search = params.search;
      if (params?.status && params.status !== "all")
        queryParams.status = params.status;
      if (params?.reader_id) queryParams.reader_id = params.reader_id;
      if (params?.book_id) queryParams.book_id = params.book_id;

      const res = await client.get(endpoints.BORROW_HISTORY, {
        params: queryParams,
      });
      const history: BorrowRecord[] = res.data?.data || [];
      const total: number = res.data?.pagination?.total_items || history.length;
      return { history, total };
    } catch (err) {
      return apiService.handleError(err, "Không thể tải lịch sử mượn trả");
    }
  },

  async createBorrow(data: CreateBorrowRecord): Promise<any> {
    try {
      const { client, endpoints } = await apiService.getClient();
      const res = await client.post(endpoints.BORROW_CREATE, data);
      if (res.data?.status === false) {
        throw new Error(res.data.message || "Tạo phiếu mượn thất bại");
      }
      return res.data;
    } catch (err) {
      return apiService.handleError(err, "Không thể lập phiếu mượn");
    }
  },

  async returnBorrow(data: ReturnBorrow): Promise<any> {
    try {
      const { client, endpoints } = await apiService.getClient();
      const res = await client.post(endpoints.BORROW_RETURN, data);
      if (res.data?.status === false) {
        throw new Error(res.data.message || "Trả sách thất bại");
      }
      return res.data;
    } catch (err) {
      return apiService.handleError(err, "Không thể thực hiện trả sách");
    }
  },

  async renewBorrow(data: RenewBorrow): Promise<any> {
    try {
      const { client, endpoints } = await apiService.getClient();
      const res = await client.post(endpoints.BORROW_RENEW, {
        borrow_id: data.borrow_id,
        extra_days: data.extra_days || 7,
      });
      if (res.data?.status === false) {
        throw new Error(res.data.message || "Gia hạn thất bại");
      }
      return res.data;
    } catch (err) {
      return apiService.handleError(err, "Không thể gia hạn phiếu mượn");
    }
  },
};
