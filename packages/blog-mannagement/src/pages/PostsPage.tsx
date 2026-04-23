import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminApi, type BlogPost } from '@/lib/admin-api';
import { getImageUrl } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Edit, Trash2, Eye, Heart, MessageSquare, CheckCircle, XCircle } from 'lucide-react';

export function PostsPage() {
  const queryClient = useQueryClient();

  const { data: posts, isLoading } = useQuery({
    queryKey: ['admin', 'posts'],
    queryFn: () => adminApi.getPosts().then((res) => res.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deletePost(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { published?: boolean } }) =>
      adminApi.updatePost(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] }),
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          文章管理
        </h1>
        <Link
          to="/posts/create"
          className="px-4 py-2 rounded-xl font-medium text-white transition-all hover:opacity-90"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          创建文章
        </Link>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        {posts?.map((post: BlogPost) => (
          <div
            key={post.id}
            className="rounded-2xl p-5 border"
            style={{
              backgroundColor: 'var(--color-bg-card)',
              borderColor: 'var(--color-border-glow)',
            }}
          >
            <div className="flex items-start gap-4">
              {post.coverImage && (
                <img
                  src={getImageUrl(post.coverImage)}
                  alt=""
                  className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3
                    className="font-semibold text-lg line-clamp-1"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {post.title}
                  </h3>
                  <span
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium flex-shrink-0"
                    style={{
                      backgroundColor: post.published
                        ? 'rgba(34, 197, 94, 0.2)'
                        : 'rgba(239, 68, 68, 0.2)',
                      color: post.published ? '#22c55e' : '#ef4444',
                    }}
                  >
                    {post.published ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <XCircle className="w-3 h-3" />
                    )}
                    {post.published ? '已发布' : '草稿'}
                  </span>
                </div>

                <p
                  className="text-sm line-clamp-2 mb-3"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {post.summary || '暂无摘要'}
                </p>

                <div
                  className="flex items-center gap-4 text-sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" /> {post.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" /> {post.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" /> {post._count?.comments || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <span
                      className="w-5 h-5 rounded-full overflow-hidden inline-flex items-center justify-center"
                      style={{
                        background:
                          'linear-gradient(135deg, var(--color-gradient-start), var(--color-gradient-end))',
                      }}
                    >
                      {post.author.avatar ? (
                        <img
                          src={getImageUrl(post.author.avatar)}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-white">
                          {post.author.nickname?.[0] || 'U'}
                        </span>
                      )}
                    </span>
                    {post.author.nickname || '未知作者'}
                  </span>
                  <span>{new Date(post.createdAt).toLocaleDateString('zh-CN')}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  to={`/posts/edit/${post.id}`}
                  className="p-2 rounded-lg transition-all hover:opacity-80"
                  style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}
                  title="编辑"
                >
                  <Edit className="w-4 h-4" />
                </Link>
                <button
                  onClick={() =>
                    updateMutation.mutate({ id: post.id, data: { published: !post.published } })
                  }
                  className="p-2 rounded-lg transition-all hover:opacity-80"
                  style={{
                    backgroundColor: post.published
                      ? 'rgba(239, 68, 68, 0.1)'
                      : 'rgba(34, 197, 94, 0.1)',
                    color: post.published ? '#ef4444' : '#22c55e',
                  }}
                  title={post.published ? '取消发布' : '发布'}
                >
                  {post.published ? (
                    <XCircle className="w-4 h-4" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => {
                    if (confirm('确定要删除这篇文章吗？')) deleteMutation.mutate(post.id);
                  }}
                  className="p-2 rounded-lg transition-all hover:opacity-80"
                  style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
                  title="删除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
