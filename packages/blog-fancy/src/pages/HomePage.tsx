import { motion } from 'framer-motion';
import { Link, Outlet } from 'react-router-dom';
import { Tag, TrendingUp, Clock, Star, BookOpen, LayoutGrid } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { blogApi, type BlogPost, type HotAuthor } from '@/lib/blog-api';
import { getImageUrl } from '@/lib/utils';

const hotTags = ['React', 'TypeScript', 'AI', 'Node.js', 'Docker', 'GraphQL', 'Next.js', 'Rust'];

const tabs = [
  { key: 'all', label: '📋 全部', icon: LayoutGrid, path: '/home/all' },
  { key: 'hot', label: '🔥 热门', icon: TrendingUp, path: '/home/hot' },
  { key: 'new', label: '🆕 最新', icon: Clock, path: '/home/new' },
  { key: 'recommend', label: '⭐ 推荐', icon: Star, path: '/home/recommend' },
  { key: 'column', label: '💎 专栏', icon: BookOpen, path: '/home/column' },
];

export function HomePage() {
  const { data: hotPosts } = useQuery<BlogPost[]>({
    queryKey: ['posts', 'hot'],
    queryFn: () => blogApi.getHotPosts().then((res) => res.data),
  });

  const { data: hotAuthors } = useQuery<HotAuthor[]>({
    queryKey: ['authors', 'hot'],
    queryFn: () => blogApi.getHotAuthors().then((res) => res.data),
  });

  const sidebarHotPosts =
    hotPosts
      ?.map((post) => ({
        id: post.id,
        title: post.title,
        hotScore: (post.views || 0) + (post.likes || 0) * 2,
      }))
      .sort((a, b) => b.hotScore - a.hotScore)
      .slice(0, 5) || [];
  return (
    <div className="min-h-screen pb-12">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative py-12 md:py-20 px-4 md:px-6 text-center"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full opacity-20 blur-[80px] md:blur-[120px]"
            style={{ backgroundColor: 'var(--color-primary)' }}
          />
          <div
            className="absolute top-1/4 right-1/4 w-[200px] md:w-[400px] h-[200px] md:w-[400px] rounded-full opacity-10 blur-[60px] md:blur-[100px]"
            style={{ backgroundColor: 'var(--color-accent)' }}
          />
        </div>

        <div className="relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6"
          >
            <span className="gradient-text">探索未知</span>
            <br />
            <span style={{ color: 'var(--color-text-primary)' }}>记录灵感</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-base md:text-xl max-w-xl md:max-w-2xl mx-auto px-4"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            发现前沿技术，分享深度思考，与志同道合的开发者一起成长
          </motion.p>
        </div>
      </motion.section>

      {/* Tabs - Sticky on mobile */}
      <div className="sticky top-[60px] md:top-[72px] z-40 glass mx-3 md:mx-6 rounded-xl md:rounded-2xl mb-6 md:mb-8">
        <div className="flex items-center gap-1 md:gap-2 p-1.5 md:p-2 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Link
                key={tab.key}
                to={tab.path}
                className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-medium whitespace-nowrap transition-all hover:bg-[var(--color-bg-secondary)]"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <Icon className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden xs:inline">{tab.label.replace(/^[^\s]+\s/, '')}</span>
                <span className="xs:hidden">{tab.label.split(' ')[1]}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 md:px-6 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Tab Content Area */}
        <div className="lg:col-span-2">
          <Outlet />
        </div>

        {/* Sidebar - Hidden on mobile, shown on lg+ */}
        <div className="hidden lg:block space-y-6">
          {/* Hot Articles */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl p-5 border"
            style={{
              backgroundColor: 'var(--color-bg-card)',
              borderColor: 'var(--color-border-glow)',
            }}
          >
            <h3
              className="text-lg font-semibold mb-4 flex items-center gap-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              <span className="text-2xl">📊</span> 热门文章
            </h3>
            <div className="space-y-3">
              {sidebarHotPosts.map((article, index) => (
                <Link
                  key={article.id}
                  to={`/article/${article.id}`}
                  className="flex items-start gap-3 group"
                >
                  <span
                    className="text-lg font-bold"
                    style={{
                      color: index < 3 ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    }}
                  >
                    {index + 1}
                  </span>
                  <span
                    className="text-sm group-hover:opacity-80 transition-colors line-clamp-2"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {article.title}
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Hot Tags */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl p-5 border"
            style={{
              backgroundColor: 'var(--color-bg-card)',
              borderColor: 'var(--color-border-glow)',
            }}
          >
            <h3
              className="text-lg font-semibold mb-4 flex items-center gap-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              <Tag className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
              热门标签
            </h3>
            <div className="flex flex-wrap gap-2">
              {hotTags.map((tag) => (
                <Link
                  key={tag}
                  to={`/tag/${tag}`}
                  className="px-3 py-1.5 text-sm rounded-full transition-all hover:scale-105"
                  style={{
                    backgroundColor: 'var(--color-bg-secondary)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {tag}
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Online Authors */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl p-5 border"
            style={{
              backgroundColor: 'var(--color-bg-card)',
              borderColor: 'var(--color-border-glow)',
            }}
          >
            <h3
              className="text-lg font-semibold mb-4 flex items-center gap-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              <span className="text-2xl">👥</span> 热门作者
            </h3>
            <div className="space-y-4">
              {hotAuthors?.map((author) => (
                <div key={author.id} className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium overflow-hidden"
                    style={{
                      background:
                        'linear-gradient(135deg, var(--color-gradient-start), var(--color-gradient-end))',
                    }}
                  >
                    {author.avatar ? (
                      <img
                        src={getImageUrl(author.avatar)}
                        alt={author.nickname || ''}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      author.nickname?.[0] || 'U'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-sm font-medium truncate"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {author.nickname}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {author.postCount} 篇 · 热度 {author.hotScore}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
