import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import type { LoginRequest, RegisterRequest, AuthResponse, UserProfile } from './auth';
import { useAuthStore } from '@/store/auth-store';

function shouldSkipTokenRefresh(config: InternalAxiosRequestConfig): boolean {
  const u = `${config.url || ''}`.toLowerCase();
  return [
    '/auth/login',
    '/auth/register',
    '/auth/refresh',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/logout',
  ].some((p) => u.includes(p));
}

/** persist 尚未水合时内存为空，从 LS 兜底（与 auth-store 的 name 一致） */
function readPersistedAuth(): { accessToken: string | null; refreshToken: string | null } {
  try {
    const raw = localStorage.getItem('auth-storage');
    if (!raw) return { accessToken: null, refreshToken: null };
    const { state } = JSON.parse(raw);
    return {
      accessToken: state?.accessToken ?? null,
      refreshToken: state?.refreshToken ?? null,
    };
  } catch {
    return { accessToken: null, refreshToken: null };
  }
}

function getAccessToken(): string | null {
  return useAuthStore.getState().accessToken || readPersistedAuth().accessToken;
}

function getRefreshToken(): string | null {
  return useAuthStore.getState().refreshToken || readPersistedAuth().refreshToken;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: unknown) => void }> =
  [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      !originalRequest ||
      shouldSkipTokenRefresh(originalRequest)
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => api(originalRequest))
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      isRefreshing = false;
      useAuthStore.getState().logout();
      return Promise.reject(error);
    }

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL || '/api'}/auth/refresh`,
        { refreshToken },
      );

      useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);
      processQueue(null);

      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);
      useAuthStore.getState().logout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export const authApi = {
  login: (data: LoginRequest) => api.post<AuthResponse>('/auth/login', data),

  register: (data: RegisterRequest) => api.post<AuthResponse>('/auth/register', data),

  refresh: (refreshToken: string) => api.post<AuthResponse>('/auth/refresh', { refreshToken }),

  logout: () => api.post('/auth/logout'),

  getProfile: () => api.get<UserProfile>('/auth/profile'),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post<{ avatar: string }>('/auth/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),

  resetPassword: (code: string, newPassword: string) =>
    api.post('/auth/reset-password', { code, newPassword }),
};

export { api };
