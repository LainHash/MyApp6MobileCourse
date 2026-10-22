import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, LoginCredentials, RegisterData } from "../types";
import { apiService } from "./apiService";

const AUTH_TOKEN_KEY = "@lib_auth_token";
const AUTH_USER_KEY = "@lib_auth_user";

export const authService = {
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const { client, endpoints } = await apiService.getClient();
      const res = await client.post(endpoints.AUTH_LOGIN, {
        username: credentials.username.trim(),
        password: credentials.password,
      });

      if (!res.data?.data) {
        throw new Error(res.data?.message || "Đăng nhập thất bại");
      }

      const user: User = res.data.data;
      if (user.token) {
        await this.saveSession(user, user.token);
      }
      return user;
    } catch (err: any) {
      return apiService.handleError(err, "Đăng nhập thất bại");
    }
  },

  async register(data: RegisterData): Promise<User> {
    try {
      const { client, endpoints } = await apiService.getClient();
      const res = await client.post(endpoints.AUTH_REGISTER, {
        username: data.username.trim(),
        password: data.password,
        full_name: data.full_name.trim(),
        email: data.email?.trim() || null,
        phone: data.phone?.trim() || null,
        role: data.role || "librarian",
      });

      if (res.data?.status === false) {
        throw new Error(res.data?.message || "Đăng ký không thành công");
      }

      return res.data.data as User;
    } catch (err: any) {
      return apiService.handleError(err, "Đăng ký không thành công");
    }
  },

  async getMe(): Promise<User> {
    try {
      const { client, endpoints } = await apiService.getClient();
      const res = await client.get(endpoints.AUTH_ME);
      if (!res.data?.data) {
        throw new Error(
          res.data?.message || "Không thể lấy thông tin tài khoản",
        );
      }
      const user: User = res.data.data;
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      return user;
    } catch (err: any) {
      return apiService.handleError(err, "Lỗi xác thực phiên đăng nhập");
    }
  },

  async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  async getStoredUser(): Promise<User | null> {
    try {
      const data = await AsyncStorage.getItem(AUTH_USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  async saveSession(user: User, token: string): Promise<void> {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  },

  async clearSession(): Promise<void> {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    await AsyncStorage.removeItem(AUTH_USER_KEY);
  },
};
