import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/auth-store';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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

/** persist 尚未水合时，内存可能为空，仍从 LS 取一次 */
function getAccessToken(): string | null {
  const fromStore = useAuthStore.getState().accessToken;
  if (fromStore) return fromStore;
  try {
    const raw = localStorage.getItem('admin-auth');
    if (!raw) return null;
    const { state } = JSON.parse(raw);
    return state?.accessToken ?? null;
  } catch {
    return null;
  }
}

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

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.authorization = `Bearer ${token}`;
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

    const refreshToken = useAuthStore.getState().refreshToken;
    let rt = refreshToken;
    if (!rt) {
      try {
        const raw = localStorage.getItem('admin-auth');
        if (raw) {
          const { state } = JSON.parse(raw);
          rt = state?.refreshToken ?? null;
        }
      } catch {
        /* ignore */
      }
    }

    if (!rt) {
      isRefreshing = false;
      return Promise.reject(error);
    }

    try {
      const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken: rt });
      const { accessToken, refreshToken: newRefreshToken } = res.data;
      useAuthStore.getState().setTokens(accessToken, newRefreshToken);
      processQueue(null);
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);
      useAuthStore.getState().logout();
      window.location.href = new URL(
        'login',
        `${window.location.origin}${import.meta.env.BASE_URL}`,
      ).toString();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
