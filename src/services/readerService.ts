import { CreateReader, Reader, UpdateReader } from "../types";
import { apiService } from "./apiService";

export const readerService = {
  async getReaders(params?: {
    search?: string;
    status?: string | null;
    page?: number;
    limit?: number;
  }): Promise<{ readers: Reader[]; total: number }> {
    try {
      const { client, endpoints } = await apiService.getClient();
      const queryParams: Record<string, any> = {
        limit: params?.limit || 100,
        page: params?.page || 1,
      };
      if (params?.search) queryParams.search = params.search;
      if (params?.status) queryParams.status = params.status;

      const res = await client.get(endpoints.READERS_LIST, {
        params: queryParams,
      });
      const readers: Reader[] = res.data?.data || [];
      const total: number = res.data?.pagination?.total_items || readers.length;
      return { readers, total };
    } catch (err) {
      return apiService.handleError(err, "Không thể tải danh sách độc giả");
    }
  },

  async getReaderDetail(id: number): Promise<Reader> {
    try {
      const { client, endpoints } = await apiService.getClient();
      const res = await client.get(endpoints.READER_DETAIL, { params: { id } });
      if (!res.data?.data)
        throw new Error(
          res.data?.message || "Không tìm thấy thông tin độc giả",
        );
      return res.data.data as Reader;
    } catch (err) {
      return apiService.handleError(err, "Không thể tải chi tiết độc giả");
    }
  },

  async createReader(reader: CreateReader): Promise<any> {
    try {
      const { client, endpoints } = await apiService.getClient();
      const res = await client.post(endpoints.READER_CREATE, reader);
      if (res.data?.status === false) {
        throw new Error(res.data.message || "Thêm độc giả thất bại");
      }
      return res.data;
    } catch (err) {
      return apiService.handleError(err, "Không thể thêm độc giả mới");
    }
  },

  async updateReader(reader: UpdateReader): Promise<any> {
    try {
      const { client, endpoints } = await apiService.getClient();
      const res = await client.post(endpoints.READER_UPDATE, reader);
      if (res.data?.status === false) {
        throw new Error(res.data.message || "Cập nhật độc giả thất bại");
      }
      return res.data;
    } catch (err) {
      return apiService.handleError(err, "Không thể cập nhật độc giả");
    }
  },

  async deleteReader(id: number): Promise<any> {
    try {
      const { client, endpoints } = await apiService.getClient();
      const res = await client.post(endpoints.READER_DELETE, { id });
      if (res.data?.status === false) {
        throw new Error(res.data.message || "Xóa độc giả thất bại");
      }
      return res.data;
    } catch (err) {
      return apiService.handleError(err, "Không thể xóa độc giả");
    }
  },
};
