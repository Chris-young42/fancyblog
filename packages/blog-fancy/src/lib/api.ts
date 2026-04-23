import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

export interface HeaderNav {
  id: number;
  label: string;
  path: string;
  order: number;
  isActive: boolean;
  category?: string;
}

export const headerApi = {
  getActiveHeaders: () => api.get<HeaderNav[]>('/header'),
};
