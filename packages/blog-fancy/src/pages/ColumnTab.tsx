import { motion } from 'framer-motion';

const mockColumns = [
  {
    id: 'col1',
    name: '前端进阶之路',
    description: '从入门到精通，系统学习前端开发',
    author: '张三',
    articleCount: 24,
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
  },
  {
    id: 'col2',
    name: '架构设计实践',
    description: '大型系统架构设计经验分享',
    author: '李四',
    articleCount: 18,
    coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
  },
  {
    id: 'col3',
    name: 'AI 应用开发',
    description: '探索 AI 在实际项目中的应用',
    author: '王五',
    articleCount: 12,
    coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
  },
];

export function ColumnTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {mockColumns.map((column, index) => (
        <motion.div
          key={column.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="rounded-2xl overflow-hidden border transition-all cursor-pointer"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            borderColor: 'var(--color-border-glow)',
          }}
        >
          <div className="h-32">
            <img src={column.coverImage} alt={column.name} className="w-full h-full object-cover" />
          </div>
          <div className="p-4">
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {column.name}
            </h3>
            <p
              className="text-sm mb-4 line-clamp-2"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {column.description}
            </p>
            <div
              className="flex items-center justify-between text-xs"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <span>作者: {column.author}</span>
              <span>{column.articleCount} 篇文章</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
