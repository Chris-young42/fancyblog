import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, type Comment } from '@/lib/admin-api';
import { getImageUrl } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';

export function CommentsPage() {
  const queryClient = useQueryClient();

  const { data: comments, isLoading } = useQuery({
    queryKey: ['admin', 'comments'],
    queryFn: () => adminApi.getComments().then((res) => res.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteComment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'comments'] }),
  });

  if (isLoading) {
    return (
      <div className="text-center py-20" style={{ color: 'var(--color-text-secondary)' }}>
        加载中...
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
        评论管理
      </h1>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        {comments?.map((comment: Comment) => (
          <div
            key={comment.id}
            className="rounded-2xl p-5 border"
            style={{
              backgroundColor: 'var(--color-bg-card)',
              borderColor: 'var(--color-border-glow)',
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium overflow-hidden shrink-0"
                  style={{
                    background:
                      'linear-gradient(135deg, var(--color-gradient-start), var(--color-gradient-end))',
                  }}
                >
                  {comment.user.avatar ? (
                    <img
                      src={getImageUrl(comment.user.avatar)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    comment.user.nickname?.[0] || 'U'
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      {comment.user.nickname || '未知用户'}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      评论于 {new Date(comment.createdAt).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                  <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                    {comment.content}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-primary)' }}>
                    文章: {comment.post.title}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (confirm('确定要删除这条评论吗？')) deleteMutation.mutate(comment.id);
                }}
                className="p-2 rounded-lg transition-all hover:opacity-80 shrink-0"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
                title="删除评论"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {(!comments || comments.length === 0) && (
          <div className="text-center py-20" style={{ color: 'var(--color-text-secondary)' }}>
            暂无评论
          </div>
        )}
      </motion.div>
    </div>
  );
}
