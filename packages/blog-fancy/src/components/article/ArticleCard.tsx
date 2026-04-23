import { motion } from 'framer-motion';
import { Calendar, MessageCircle, Eye, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn, getImageUrl } from '@/lib/utils';

interface ArticleCardProps {
  id: string;
  title: string;
  excerpt: string;
  coverImage: string;
  author: string;
  date: string;
  category: string;
  views: number;
  comments: number;
  className?: string;
}

export function ArticleCard({
  id,
  title,
  excerpt,
  coverImage,
  author,
  date,
  category,
  views,
  comments,
  className,
}: ArticleCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group relative rounded-xl md:rounded-2xl overflow-hidden border transition-all duration-300',
        className,
      )}
      style={{
        backgroundColor: 'var(--color-bg-card)',
        borderColor: 'transparent',
      }}
    >
      <Link to={`/article/${id}`} className="block">
        <div className="relative h-36 sm:h-48 overflow-hidden">
          <motion.img
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.3 }}
            src={getImageUrl(coverImage)}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0 opacity-60"
            style={{
              background: 'linear-gradient(to top, var(--color-bg-primary), transparent)',
            }}
          />
          <span
            className="absolute top-2 left-2 md:top-4 md:left-4 px-2 md:px-3 py-0.5 md:py-1 text-xs md:text-sm font-medium rounded-full text-white"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            {category}
          </span>
        </div>

        <div className="p-3 md:p-5">
          <h3
            className="text-base md:text-lg font-semibold mb-1.5 md:mb-2 line-clamp-2 group-hover:opacity-80 transition-opacity"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {title}
          </h3>
          <p
            className="text-sm mb-3 md:mb-4 line-clamp-2 hidden sm:block"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {excerpt}
          </p>

          <div
            className="flex items-center justify-between text-xs"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <div className="flex items-center gap-2 md:gap-4">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span className="hidden xs:inline">{author}</span>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span className="hidden sm:inline">{date}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span className="hidden xs:inline">{views}</span>
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                <span className="hidden xs:inline">{comments}</span>
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
