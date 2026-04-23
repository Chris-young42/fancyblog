import { useEffect } from 'react';
import { useRoutes, useLocation, useNavigate } from 'react-router-dom';
import { routes } from './routes';
import { useAuthStore } from '@/store/auth-store';
import { Navbar } from '@/components/layout/Navbar';

export function AppRoutes() {
  const element = useRoutes(routes);
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const isLoginPage = location.pathname === '/login';

    if (!isAuthenticated && !isLoginPage) {
      navigate('/login');
    } else if (isAuthenticated && isLoginPage) {
      navigate('/home');
    } else if (isAuthenticated && location.pathname === '/') {
      navigate('/home');
    }
  }, [isAuthenticated, navigate, location]);

  if (location.pathname === '/login') {
    return element;
  }

  return (
    <>
      <Navbar />
      {element}
    </>
  );
}
