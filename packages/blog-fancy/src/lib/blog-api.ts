import { api } from './auth-api';

export interface BlogPost {
  id: number;
  title: string;
  summary: string | null;
  coverImage: string | null;
  category: string;
  tags: string[];
  createdAt: string;
  authorId: number;
  author: {
    id?: number;
    nickname: string | null;
    avatar: string | null;
  };
  views?: number;
  likes?: number;
}

export interface BlogPostDetail extends BlogPost {
  content: string;
  liked?: boolean;
}

export interface HotAuthor {
  id: number;
  nickname: string | null;
  avatar: string | null;
  postCount: number;
  hotScore: number;
}

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  postId: number;
  user: {
    id: number;
    nickname: string | null;
    avatar: string | null;
  };
}

export interface LikeResponse {
  likes: number;
  liked: boolean;
}

export const blogApi = {
  getPosts: () => api.get<BlogPost[]>('/blog/posts'),

  getHotPosts: () => api.get<BlogPost[]>('/blog/posts/hot'),

  getPost: (id: number) => api.get<BlogPostDetail>(`/blog/posts/${id}`),

  getCategories: () => api.get<{ category: string }[]>('/blog/categories'),

  getTags: () => api.get<string[]>('/blog/tags'),

  incrementView: (postId: number) => api.patch(`/blog/posts/${postId}/view`),

  likePost: (postId: number) => api.post<LikeResponse>(`/blog/posts/${postId}/like`),

  unlikePost: (postId: number) => api.delete<LikeResponse>(`/blog/posts/${postId}/like`),

  hasLiked: (postId: number) => api.get<boolean>(`/blog/posts/${postId}/liked`),

  getComments: (postId: number) => api.get<Comment[]>(`/blog/posts/${postId}/comments`),

  createComment: (postId: number, content: string) =>
    api.post<Comment>(`/blog/posts/${postId}/comments`, { content }),

  deleteComment: (commentId: number) => api.delete(`/blog/comments/${commentId}`),

  searchPosts: (query: string) =>
    api.get<BlogPost[]>(`/blog/search?q=${encodeURIComponent(query)}`),

  getHotAuthors: () => api.get<HotAuthor[]>(`/blog/authors/hot`),

  getPostsByCategory: (category: string) =>
    api.get<BlogPost[]>(`/blog/posts/category/${encodeURIComponent(category)}`),
};

export interface FollowingUser {
  id: number;
  nickname: string | null;
  avatar: string | null;
}

export const followApi = {
  follow: (userId: number) => api.post(`/follow/${userId}`),

  unfollow: (userId: number) => api.delete(`/follow/${userId}`),

  isFollowing: (userId: number) => api.get<boolean>(`/follow/${userId}/status`),

  getFollowing: () => api.get<FollowingUser[]>('/follow/following'),

  getFollowingPosts: () => api.get<BlogPost[]>('/follow/posts'),
};
