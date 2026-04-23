import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRoutes } from '@/AppRoutes';
import { useThemeStore } from '@/store/theme-store';
import { useEffect } from 'react';

const queryClient = new QueryClient();

function ThemeSync() {
  const { theme } = useThemeStore();

  useEffect(() => {
    document.body.classList.toggle('light', theme === 'light');
  }, [theme]);

  return null;
}

function AppContent() {
  return (
    <>
      <ThemeSync />
      <AppRoutes />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
