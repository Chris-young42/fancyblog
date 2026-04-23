import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AdminLayout } from './components/layout/AdminLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { UsersPage } from './pages/UsersPage';
import { PostsPage } from './pages/PostsPage';
import { CommentsPage } from './pages/CommentsPage';
import { CreatePostPage } from './pages/CreatePostPage';
import { EditPostPage } from './pages/EditPostPage';
import { MyPostsPage } from './pages/MyPostsPage';
import { MyCommentsPage } from './pages/MyCommentsPage';
import { CreatePostPage as UserCreatePostPage } from './pages/UserCreatePostPage';
import { EditPostPage as UserEditPostPage } from './pages/UserEditPostPage';
import { HeadersPage } from './pages/HeadersPage';
import { ProtectedRoute } from './components/ProtectedRoute';

export const router = createBrowserRouter(
  [
    {
      path: '/login',
      element: <LoginPage />,
    },
    {
      path: '/',
      element: (
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <Navigate to="/dashboard" replace /> },
        // Admin routes
        { path: 'dashboard', element: <DashboardPage /> },
        { path: 'users', element: <UsersPage /> },
        { path: 'posts', element: <PostsPage /> },
        { path: 'posts/create', element: <CreatePostPage /> },
        { path: 'posts/edit/:id', element: <EditPostPage /> },
        { path: 'comments', element: <CommentsPage /> },
        { path: 'headers', element: <HeadersPage /> },
        // User routes
        { path: 'my-posts', element: <MyPostsPage /> },
        { path: 'my-posts/create', element: <UserCreatePostPage /> },
        { path: 'my-posts/edit/:id', element: <UserEditPostPage /> },
        { path: 'my-comments', element: <MyCommentsPage /> },
      ],
    },
  ],
  { basename: '/' },
);
