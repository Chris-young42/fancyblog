import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { blogApi, type BlogPost } from '@/lib/blog-api';
import { getImageUrl } from '@/lib/utils';

export function NewTab() {
  const { data: posts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ['posts'],
    queryFn: () => blogApi.getPosts().then((res) => res.data),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-32 rounded-2xl animate-pulse"
            style={{ backgroundColor: 'var(--color-bg-card)' }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts
        ?.slice()
        .reverse()
        .map((article, index) => (
          <motion.a
            key={article.id}
            href={`/article/${article.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="block rounded-2xl overflow-hidden border transition-all hover:border-[var(--color-accent)]"
            style={{
              backgroundColor: 'var(--color-bg-card)',
              borderColor: 'var(--color-border-glow)',
            }}
          >
            <div className="flex flex-col md:flex-row">
              <div className="md:w-64 h-48 md:h-32">
                <img
                  src={getImageUrl(article.coverImage)}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 p-4">
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {article.title}
                </h3>
                <p
                  className="text-sm mb-4 line-clamp-2"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {article.summary}
                </p>
                <div
                  className="flex items-center gap-4 text-xs"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <span>{article.author.nickname}</span>
                  <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </motion.a>
        ))}
    </div>
  );
}
