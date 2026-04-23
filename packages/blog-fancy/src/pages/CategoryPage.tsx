import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { blogApi, type BlogPost } from '@/lib/blog-api';
import { ArticleCard } from '@/components/article/ArticleCard';
import { ArrowLeft, Loader2 } from 'lucide-react';

export function CategoryPage() {
  const { category } = useParams();
  const decodedCategory = decodeURIComponent(category || '');

  const { data: posts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ['posts', 'category', decodedCategory],
    queryFn: () => blogApi.getPostsByCategory(decodedCategory).then((res) => res.data),
    enabled: !!decodedCategory,
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12"
      >
        <Link
          to="/home"
          className="inline-flex items-center gap-2 mb-6 text-sm transition-opacity hover:opacity-80"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">{decodedCategory}</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>{posts?.length || 0} 篇文章</p>
      </motion.div>

      {/* Posts */}
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--color-primary)' }} />
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ArticleCard
                  id={String(post.id)}
                  title={post.title}
                  excerpt={post.summary || ''}
                  coverImage={post.coverImage || ''}
                  author={post.author.nickname || '匿名'}
                  date={new Date(post.createdAt).toLocaleDateString('zh-CN')}
                  category={post.category}
                  views={post.views || 0}
                  comments={0}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-5xl mb-4">📭</div>
            <p style={{ color: 'var(--color-text-secondary)' }}>该分类下暂无文章</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
