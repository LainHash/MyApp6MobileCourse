import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, LoginCredentials, RegisterData } from "../types";
import { authService } from "../services/authService";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          authService.getStoredToken(),
          authService.getStoredUser(),
        ]);

        if (isMounted && storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);

          // Optionally verify and refresh in background
          try {
            const freshUser = await authService.getMe();
            if (isMounted) setUser(freshUser);
          } catch {
            // Keep cached user if offline or network hiccup
          }
        }
      } catch (err) {
        console.warn("Lỗi khôi phục phiên đăng nhập:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (credentials: LoginCredentials): Promise<User> => {
    const loggedInUser = await authService.login(credentials);
    setUser(loggedInUser);
    setToken(loggedInUser.token || null);
    return loggedInUser;
  };

  const register = async (data: RegisterData): Promise<User> => {
    const newUser = await authService.register(data);
    return newUser;
  };

  const logout = async (): Promise<void> => {
    await authService.clearSession();
    setUser(null);
    setToken(null);
  };

  const updateUser = (updatedUser: Partial<User>) => {
    if (!user) return;
    const merged = { ...user, ...updatedUser };
    setUser(merged);
    if (token) {
      authService.saveSession(merged, token).catch(() => {});
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      if (token) {
        const freshUser = await authService.getMe();
        setUser(freshUser);
      }
    } catch (err) {
      console.warn("Không thể làm mới thông tin tài khoản:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
