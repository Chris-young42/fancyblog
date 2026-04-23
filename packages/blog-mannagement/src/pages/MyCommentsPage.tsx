import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi, type Comment } from '@/lib/admin-api';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';

export function MyCommentsPage() {
  const queryClient = useQueryClient();

  const { data: comments, isLoading } = useQuery({
    queryKey: ['my', 'comments'],
    queryFn: () => userApi.getMyComments().then((res) => res.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => userApi.deleteComment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my', 'comments'] }),
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
        我的评论
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
              <div>
                <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                  {comment.content}
                </p>
                <p className="text-xs" style={{ color: 'var(--color-primary)' }}>
                  评论于: {comment.post.title}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                  {new Date(comment.createdAt).toLocaleDateString('zh-CN')}
                </p>
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
