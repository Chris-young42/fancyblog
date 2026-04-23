import api from './api';

export interface User {
  id: number;
  email: string;
  username: string;
  nickname: string | null;
  avatar: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  _count?: {
    posts: number;
    comments: number;
    followers: number;
    following: number;
  };
}

export interface BlogPost {
  id: number;
  title: string;
  content: string;
  summary: string | null;
  coverImage: string | null;
  category: string;
  tags: string | string[];
  published: boolean;
  views: number;
  likes: number;
  createdAt: string;
  author: {
    id: number;
    nickname: string | null;
    avatar: string | null;
  };
  _count?: {
    comments: number;
    postLikes: number;
  };
}

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  user: {
    id: number;
    nickname: string | null;
    avatar: string | null;
  };
  post: {
    id: number;
    title: string;
  };
}

export interface Stats {
  userCount: number;
  postCount: number;
  commentCount: number;
}

export interface HeaderNav {
  id: number;
  label: string;
  path: string;
  category?: string;
  order: number;
  isActive: boolean;
}

export const adminApi = {
  // Stats
  getStats: () => api.get<Stats>('/admin/stats'),

  // Headers
  getHeaders: () =>
    api.get<{ data: HeaderNav[]; total: number; page: number; pageSize: number }>('/header/admin'),
  createHeader: (data: {
    label: string;
    path: string;
    category?: string;
    order?: number;
    isActive?: boolean;
  }) => api.post<HeaderNav>('/header', data),
  updateHeader: (
    id: number,
    data: Partial<{
      label: string;
      path: string;
      category?: string;
      order?: number;
      isActive?: boolean;
    }>,
  ) => api.put<HeaderNav>(`/header/${id}`, data),
  deleteHeader: (id: number) => api.delete(`/header/${id}`),

  // Upload
  uploadCover: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ url: string }>('/admin/upload/cover', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Users
  getUsers: () => api.get<User[]>('/admin/users'),
  getUser: (id: number) => api.get<User>(`/admin/users/${id}`),
  updateUser: (id: number, data: { nickname?: string; role?: string; isActive?: boolean }) =>
    api.put<User>(`/admin/users/${id}`, data),
  deleteUser: (id: number) => api.delete(`/admin/users/${id}`),

  // Posts
  getPosts: () => api.get<BlogPost[]>('/admin/posts'),
  getPost: (id: number) => api.get<BlogPost>(`/admin/posts/${id}`),
  createPost: (data: {
    title: string;
    content: string;
    summary?: string;
    coverImage?: string;
    category: string;
    tags: string[];
    published: boolean;
    authorId: number;
  }) => api.post<BlogPost>('/admin/posts', data),
  updatePost: (
    id: number,
    data: Partial<{
      title: string;
      content: string;
      summary: string;
      coverImage: string;
      category: string;
      tags: string[];
      published: boolean;
    }>,
  ) => api.put<BlogPost>(`/admin/posts/${id}`, data),
  deletePost: (id: number) => api.delete(`/admin/posts/${id}`),

  // Comments
  getComments: () => api.get<Comment[]>('/admin/comments'),
  deleteComment: (id: number) => api.delete(`/admin/comments/${id}`),
};

export const authApi = {
  login: (identifier: string, password: string) =>
    api.post('/auth/login', { identifier, password }),
  register: (data: { email: string; username: string; password: string; nickname?: string }) =>
    api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  logout: () => api.post('/auth/logout'),
};

export const userApi = {
  // Upload
  uploadCover: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ url: string }>('/user/upload/cover', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Posts (user's own)
  getMyPosts: () => api.get<BlogPost[]>('/user/posts'),
  getMyPost: (id: number) => api.get<BlogPost>(`/user/posts/${id}`),
  createPost: (data: {
    title: string;
    content: string;
    summary?: string;
    coverImage?: string;
    category: string;
    tags: string[];
    published: boolean;
  }) => api.post<BlogPost>('/user/posts', data),
  updatePost: (
    id: number,
    data: Partial<{
      title: string;
      content: string;
      summary: string;
      coverImage: string;
      category: string;
      tags: string[];
      published: boolean;
    }>,
  ) => api.put<BlogPost>(`/user/posts/${id}`, data),
  deletePost: (id: number) => api.delete(`/user/posts/${id}`),

  // Comments (user's own)
  getMyComments: () => api.get<Comment[]>('/user/comments'),
  deleteComment: (id: number) => api.delete(`/user/comments/${id}`),
};
