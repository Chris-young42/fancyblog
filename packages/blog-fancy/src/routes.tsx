import { type RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { LoginPage } from '@/pages/LoginPage';
import { HomePage } from '@/pages/HomePage';
import { AllTab } from '@/pages/AllTab';
import { HotTab } from '@/pages/HotTab';
import { NewTab } from '@/pages/NewTab';
import { RecommendTab } from '@/pages/RecommendTab';
import { ColumnTab } from '@/pages/ColumnTab';
import { ArticlePage } from '@/pages/ArticlePage';
import { CategoryPage } from '@/pages/CategoryPage';
import { TagPage } from '@/pages/TagPage';

export const routes: RouteObject[] = [
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '/login', element: <LoginPage /> },
  {
    path: '/home',
    element: <HomePage />,
    children: [
      { index: true, element: <Navigate to="all" replace /> },
      { path: 'all', element: <AllTab /> },
      { path: 'hot', element: <HotTab /> },
      { path: 'new', element: <NewTab /> },
      { path: 'recommend', element: <RecommendTab /> },
      { path: 'column', element: <ColumnTab /> },
    ],
  },
  { path: '/article/:id', element: <ArticlePage /> },
  { path: '/category/:category', element: <CategoryPage /> },
  { path: '/tag/:tag', element: <TagPage /> },
];
