import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-api';
import { Users, FileText, MessageSquare, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export function DashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminApi.getStats().then((res) => res.data),
  });

  const statCards = [
    { label: '用户总数', value: stats?.userCount || 0, icon: Users, color: '#6366f1' },
    { label: '文章总数', value: stats?.postCount || 0, icon: FileText, color: '#22d3ee' },
    { label: '评论总数', value: stats?.commentCount || 0, icon: MessageSquare, color: '#f97316' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
        仪表盘
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-2xl p-6 border"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                borderColor: 'var(--color-border-glow)',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${card.color}20` }}
                >
                  <Icon className="w-6 h-6" style={{ color: card.color }} />
                </div>
                <TrendingUp className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
              </div>
              <div
                className="text-3xl font-bold mb-1"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {card.value}
              </div>
              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {card.label}
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl p-6 border"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          borderColor: 'var(--color-border-glow)',
        }}
      >
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
          欢迎回来，管理员
        </h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          这里可以看到系统的整体运行状态和数据统计
        </p>
      </motion.div>
    </div>
  );
}
