import axios, { create } from "axios";
import type { AxiosInstance } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  createEndpoints,
  DEFAULT_API_BASE_URL,
  formatBaseUrl,
} from "../constants/endpoint";

const SERVER_URL_KEY = "@lib_api_base_url";

export interface DashboardStatsData {
  books: {
    total_titles: number;
    total_copies: number;
    available_copies: number;
    borrowed_copies: number;
  };
  readers: {
    total_readers: number;
    active_readers: number;
    locked_readers: number;
    expired_readers: number;
  };
  borrows: {
    total_records: number;
    total_returned: number;
    current_borrowing: number;
    current_overdue: number;
    total_fines_collected: number;
  };
  top_books?: {
    id: number;
    title: string;
    author: string;
    image_url: string;
    category_name: string;
    available_copies: number;
    total_copies: number;
    borrow_count: number;
  }[];
  categories?: {
    id: number;
    name: string;
    icon: string;
    book_count: number;
    total_copies: number;
  }[];
}

export const apiService = {
  async getBaseUrl(): Promise<string> {
    try {
      const stored = await AsyncStorage.getItem(SERVER_URL_KEY);
      return stored
        ? formatBaseUrl(stored)
        : formatBaseUrl(DEFAULT_API_BASE_URL);
    } catch {
      return formatBaseUrl(DEFAULT_API_BASE_URL);
    }
  },

  async setBaseUrl(url: string): Promise<string> {
    const formatted = formatBaseUrl(url);
    await AsyncStorage.setItem(SERVER_URL_KEY, formatted);
    return formatted;
  },

  async getClient(): Promise<{
    client: AxiosInstance;
    endpoints: ReturnType<typeof createEndpoints>;
    baseUrl: string;
  }> {
    const baseUrl = await this.getBaseUrl();
    const endpoints = createEndpoints(baseUrl);
    const token = await AsyncStorage.getItem("@lib_auth_token");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const client = create({
      baseURL: endpoints.BASE,
      timeout: 8000,
      headers,
    });
    return { client, endpoints, baseUrl };
  },

  handleError(error: any, fallbackMessage: string): never {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    if (error.code === "ECONNABORTED") {
      throw new Error(
        "Yêu cầu quá thời gian chờ (Timeout). Vui lòng kiểm tra kết nối mạng/máy chủ.",
      );
    }
    if (error.message?.includes("Network Error")) {
      throw new Error(
        "Không thể kết nối đến máy chủ API. Vui lòng kiểm tra IP máy chủ và kết nối Wi-Fi.",
      );
    }
    throw new Error(error.message || fallbackMessage);
  },

  async testConnection(
    customUrl?: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const url = customUrl
        ? formatBaseUrl(customUrl)
        : await this.getBaseUrl();
      const endpoints = createEndpoints(url);
      const res = await axios.get(endpoints.BOOKS_LIST, {
        params: { limit: 1 },
        timeout: 4000,
      });
      if (res.status === 200 && res.data?.status !== false) {
        return { success: true, message: `Kết nối thành công tới máy chủ!` };
      }
      return {
        success: false,
        message: res.data?.message || `Lỗi máy chủ (${res.status})`,
      };
    } catch (err: any) {
      return {
        success: false,
        message:
          err.response?.data?.message ||
          err.message ||
          "Không thể kết nối đến máy chủ API.",
      };
    }
  },

  async getDashboardStats(): Promise<DashboardStatsData> {
    try {
      const { client, endpoints } = await this.getClient();
      const res = await client.get(endpoints.STATS_DASHBOARD);
      return res.data?.data as DashboardStatsData;
    } catch (err) {
      return this.handleError(err, "Không thể tải thống kê bảng điều khiển");
    }
  },
};
