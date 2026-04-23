import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  user: {
    userId: number;
    email: string;
    role: string;
  } | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (data: {
    accessToken: string;
    refreshToken: string;
    user: { userId: number; email: string; role: string };
  }) => void;
  /** 刷新 access 后同步内存与持久化，避免仅改 localStorage 与 zustand 脱节 */
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      login: (data) =>
        set({
          isAuthenticated: true,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: data.user,
        }),
      setTokens: (accessToken, refreshToken) =>
        set((s) => ({
          ...s,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        })),
      logout: () =>
        set({
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
          user: null,
        }),
    }),
    {
      name: 'admin-auth',
    },
  ),
);
