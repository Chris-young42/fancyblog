import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  MessageSquare,
  LogOut,
  PenSquare,
  BookOpen,
  Navigation,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth-store';
import { authApi } from '@/lib/admin-api';

const adminNavItems = [
  { path: '/dashboard', label: '仪表盘', icon: LayoutDashboard },
  { path: '/users', label: '用户管理', icon: Users },
  { path: '/posts', label: '文章管理', icon: FileText },
  { path: '/comments', label: '评论管理', icon: MessageSquare },
  { path: '/headers', label: '导航管理', icon: Navigation },
];

const userNavItems = [
  { path: '/my-posts', label: '我的文章', icon: BookOpen },
  { path: '/my-comments', label: '我的评论', icon: MessageSquare },
];

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const navItems = isAdmin ? adminNavItems : userNavItems;

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {}
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside
        className="w-64 border-r flex flex-col"
        style={{
          backgroundColor: 'var(--color-bg-secondary)',
          borderColor: 'var(--color-border-glow)',
        }}
      >
        {/* Logo */}
        <div className="p-6 border-b" style={{ borderColor: 'var(--color-border-glow)' }}>
          <h1 className="text-xl font-bold gradient-text">{isAdmin ? '管理后台' : '作者中心'}</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            {user?.email}
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                style={{
                  backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--color-text-secondary)',
                }}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 space-y-1 border-t" style={{ borderColor: 'var(--color-border-glow)' }}>
          <Link
            to={isAdmin ? '/posts/create' : '/my-posts/create'}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: '#fff',
            }}
          >
            <PenSquare className="w-5 h-5" />
            <span className="font-medium">发布文章</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:opacity-80"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">退出登录</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className="flex-1 p-6 overflow-auto"
        style={{ backgroundColor: 'var(--color-bg-primary)' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
