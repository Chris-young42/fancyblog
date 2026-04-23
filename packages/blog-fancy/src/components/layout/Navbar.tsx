import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, Loader2, Menu, X, LogOut, Camera } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { headerApi, type HeaderNav } from '@/lib/api';
import { blogApi, type BlogPost } from '@/lib/blog-api';
import { authApi } from '@/lib/auth-api';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useAuthStore } from '@/store/auth-store';
import { getImageUrl } from '@/lib/utils';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isAuthenticated, logout, user, setUser } = useAuthStore();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: headers, isLoading } = useQuery({
    queryKey: ['headers'],
    queryFn: () => headerApi.getActiveHeaders().then((res) => res.data),
  });

  const { data: searchResults = [] } = useQuery<BlogPost[]>({
    queryKey: ['search', searchQuery],
    queryFn: () => blogApi.searchPosts(searchQuery).then((res) => res.data),
    enabled: searchQuery.trim().length > 0,
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) => authApi.uploadAvatar(file),
    onSuccess: (data) => {
      if (user) {
        setUser({ ...user, avatar: data.data.avatar });
      }
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearchResultClick = (postId: number) => {
    setShowSearchResults(false);
    setSearchQuery('');
    navigate(`/article/${postId}`);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAvatarMutation.mutate(file);
    }
    e.target.value = '';
  };

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass sticky top-0 z-50 px-4 py-3 md:px-6"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2">
            <motion.div
              className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center"
              style={{
                background:
                  'linear-gradient(135deg, var(--color-gradient-start), var(--color-gradient-end))',
              }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-white font-bold text-sm md:text-lg">B</span>
            </motion.div>
            <span className="text-lg md:text-xl font-bold gradient-text">BlogFancy</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {isLoading ? (
              <Loader2
                className="w-4 h-4 animate-spin"
                style={{ color: 'var(--color-text-secondary)' }}
              />
            ) : (
              headers?.map((header: HeaderNav) => (
                <Link
                  key={header.id}
                  to={
                    header.category
                      ? `/category/${encodeURIComponent(header.category)}`
                      : header.path
                  }
                  className="nav-link"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {header.label}
                </Link>
              ))
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <div className="relative" ref={searchRef}>
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: 'var(--color-text-secondary)' }}
              />
              <input
                type="text"
                placeholder="搜索文章..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => setShowSearchResults(true)}
                className="w-32 lg:w-48 pl-10 pr-4 py-2 rounded-xl text-sm focus:outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border-glow)',
                  color: 'var(--color-text-primary)',
                }}
              />

              <AnimatePresence>
                {showSearchResults && searchQuery.trim() && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full mt-2 left-0 right-0 rounded-xl border overflow-hidden"
                    style={{
                      backgroundColor: 'var(--color-bg-card)',
                      borderColor: 'var(--color-border-glow)',
                      maxHeight: '400px',
                      overflowY: 'auto',
                      zIndex: 100,
                    }}
                  >
                    {searchResults.length > 0 ? (
                      searchResults.map((post) => (
                        <button
                          key={post.id}
                          onClick={() => handleSearchResultClick(post.id)}
                          className="w-full px-4 py-3 text-left hover:bg-[var(--color-bg-secondary)] transition-colors"
                        >
                          <div
                            style={{ color: 'var(--color-text-primary)' }}
                            className="font-medium truncate"
                          >
                            {post.title}
                          </div>
                          <div
                            style={{ color: 'var(--color-text-secondary)' }}
                            className="text-xs truncate"
                          >
                            {post.summary || post.category}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div
                        className="px-4 py-3 text-center"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        未找到相关文章
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <ThemeToggle />

            {isAuthenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-9 h-9 rounded-full overflow-hidden transition-all hover:scale-105"
                  style={{ border: '2px solid var(--color-border-glow)' }}
                >
                  {user.avatar ? (
                    <img
                      src={getImageUrl(user.avatar)}
                      alt={user.nickname}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-white font-medium"
                      style={{
                        background:
                          'linear-gradient(135deg, var(--color-gradient-start), var(--color-gradient-end))',
                      }}
                    >
                      {user.nickname?.[0] || 'U'}
                    </div>
                  )}
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full right-0 mt-2 w-48 rounded-xl border overflow-hidden"
                      style={{
                        backgroundColor: 'var(--color-bg-card)',
                        borderColor: 'var(--color-border-glow)',
                        zIndex: 100,
                      }}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        onClick={handleAvatarClick}
                        className="w-full px-4 py-3 text-left flex items-center gap-2 hover:bg-[var(--color-bg-secondary)] transition-colors"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        <Camera className="w-4 h-4" />
                        上传头像
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-left flex items-center gap-2 hover:bg-[var(--color-bg-secondary)] transition-colors"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        <LogOut className="w-4 h-4" />
                        登出
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl transition-all hover:scale-105"
                style={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border-glow)',
                  color: 'var(--color-text-secondary)',
                }}
                title="登出"
              >
                <LogOut className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="p-2 rounded-xl transition-all hover:scale-105"
                style={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border-glow)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <User className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl"
            style={{
              backgroundColor: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border-glow)',
            }}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" style={{ color: 'var(--color-text-primary)' }} />
            ) : (
              <Menu className="w-5 h-5" style={{ color: 'var(--color-text-primary)' }} />
            )}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t overflow-hidden"
            style={{ borderColor: 'var(--color-border-glow)' }}
          >
            <div className="px-4 py-4 space-y-4">
              {/* Mobile Search */}
              <div className="relative" ref={searchRef}>
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: 'var(--color-text-secondary)' }}
                />
                <input
                  type="text"
                  placeholder="搜索文章..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchResults(true);
                  }}
                  onFocus={() => setShowSearchResults(true)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border-glow)',
                    color: 'var(--color-text-primary)',
                  }}
                />

                {/* Mobile Search Results */}
                <AnimatePresence>
                  {showSearchResults && searchQuery.trim() && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-2 rounded-xl border overflow-hidden"
                      style={{
                        backgroundColor: 'var(--color-bg-card)',
                        borderColor: 'var(--color-border-glow)',
                        maxHeight: '300px',
                        overflowY: 'auto',
                      }}
                    >
                      {searchResults.length > 0 ? (
                        searchResults.map((post) => (
                          <button
                            key={post.id}
                            onClick={() => {
                              setMobileMenuOpen(false);
                              handleSearchResultClick(post.id);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-[var(--color-bg-secondary)] transition-colors"
                          >
                            <div
                              style={{ color: 'var(--color-text-primary)' }}
                              className="font-medium truncate"
                            >
                              {post.title}
                            </div>
                            <div
                              style={{ color: 'var(--color-text-secondary)' }}
                              className="text-xs truncate"
                            >
                              {post.summary || post.category}
                            </div>
                          </button>
                        ))
                      ) : (
                        <div
                          className="px-4 py-3 text-center"
                          style={{ color: 'var(--color-text-secondary)' }}
                        >
                          未找到相关文章
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Navigation Links */}
              <div className="space-y-2">
                {isLoading ? (
                  <Loader2
                    className="w-4 h-4 animate-spin"
                    style={{ color: 'var(--color-text-secondary)' }}
                  />
                ) : (
                  headers?.map((header: HeaderNav) => (
                    <Link
                      key={header.id}
                      to={
                        header.category
                          ? `/category/${encodeURIComponent(header.category)}`
                          : header.path
                      }
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-xl transition-colors"
                      style={{
                        backgroundColor: 'var(--color-bg-secondary)',
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      {header.label}
                    </Link>
                  ))
                )}
              </div>

              {/* Mobile Actions */}
              <div
                className="flex items-center gap-3 pt-2"
                style={{ borderTop: '1px solid var(--color-border-glow)' }}
              >
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl"
                    style={{
                      backgroundColor: 'var(--color-bg-secondary)',
                      border: '1px solid var(--color-border-glow)',
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                      登出
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/login');
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl"
                    style={{
                      backgroundColor: 'var(--color-bg-secondary)',
                      border: '1px solid var(--color-border-glow)',
                    }}
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                      登录
                    </span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
