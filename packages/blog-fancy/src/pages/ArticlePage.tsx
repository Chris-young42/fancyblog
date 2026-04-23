import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  Calendar,
  Eye,
  Share2,
  ThumbsUp,
  User,
  ArrowLeft,
  Loader2,
  MessageCircle,
  Trash2,
  UserPlus,
  UserCheck,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { cn, getImageUrl } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blogApi, type Comment } from '@/lib/blog-api';
import { followApi } from '@/lib/blog-api';
import { useAuthStore } from '@/store/auth-store';

export function ArticlePage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [commentContent, setCommentContent] = useState('');
  const [liked, setLiked] = useState(false);

  const {
    data: article,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['post', id],
    queryFn: () => blogApi.getPost(Number(id)).then((res) => res.data),
    enabled: !!id,
  });

  const { data: comments = [], refetch: refetchComments } = useQuery<Comment[]>({
    queryKey: ['comments', id],
    queryFn: () => blogApi.getComments(Number(id)).then((res) => res.data),
    enabled: !!id,
  });

  const { data: hasLiked } = useQuery<boolean>({
    queryKey: ['liked', id],
    queryFn: () => blogApi.hasLiked(Number(id)).then((res) => res.data),
    enabled: !!id && !!user,
  });

  useEffect(() => {
    if (hasLiked !== undefined) {
      setLiked(hasLiked);
    }
  }, [hasLiked]);

  useEffect(() => {
    if (id) {
      blogApi.incrementView(Number(id)).catch(console.error);
    }
  }, [id]);

  const likeMutation = useMutation({
    mutationFn: () =>
      liked
        ? blogApi.unlikePost(Number(id)).then((res) => res.data)
        : blogApi.likePost(Number(id)).then((res) => res.data),
    onSuccess: (data) => {
      if (data) {
        setLiked(data.liked);
      }
      refetch();
    },
  });

  const unlikeMutation = useMutation({
    mutationFn: () => blogApi.unlikePost(Number(id)).then((res) => res.data),
    onSuccess: (data) => {
      if (data) {
        setLiked(data.liked);
      }
      refetch();
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: (content: string) => blogApi.createComment(Number(id), content),
    onSuccess: () => {
      setCommentContent('');
      refetchComments();
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => blogApi.deleteComment(commentId),
    onSuccess: () => refetchComments(),
  });

  const { data: isFollowing } = useQuery({
    queryKey: ['following', article?.author?.id],
    queryFn: () => followApi.isFollowing(article!.authorId).then((res) => res.data),
    enabled: !!article?.author?.id && !!user && user.id !== article.author.id,
  });

  const followMutation = useMutation({
    mutationFn: () => followApi.follow(article!.authorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['following', article?.author?.id] });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: () => followApi.unfollow(article!.authorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['following', article?.author?.id] });
    },
  });

  const handleLike = () => {
    if (liked) {
      unlikeMutation.mutate();
    } else {
      likeMutation.mutate();
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentContent.trim()) {
      createCommentMutation.mutate(commentContent);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            文章不存在
          </h1>
          <Link to="/home" className="underline" style={{ color: 'var(--color-primary)' }}>
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-6 pt-6">
        <Link
          to="/home"
          className="inline-flex items-center gap-2 transition-colors"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </Link>
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto px-6 py-12 text-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative h-64 rounded-2xl overflow-hidden mb-8"
        >
          <img
            src={getImageUrl(article.coverImage)}
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to top, var(--color-bg-primary), transparent 70%)',
            }}
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl md:text-5xl font-bold mb-4"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {article.title}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-6 text-sm"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <span className="flex items-center gap-2">
            <User className="w-4 h-4" />
            {article.author.nickname}
          </span>
          <span className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {new Date(article.createdAt).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            {article.views || 0} 阅读
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-2 mt-4"
        >
          {article.tags.map((tag) => (
            <Link
              key={tag}
              to={`/tag/${tag}`}
              className="px-3 py-1 text-sm rounded-full transition-all hover:scale-105"
              style={{
                backgroundColor: 'var(--color-bg-secondary)',
                color: 'var(--color-text-secondary)',
              }}
            >
              {tag}
            </Link>
          ))}
        </motion.div>
      </motion.header>

      {/* Content */}
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="max-w-4xl mx-auto px-6"
      >
        <div
          className="rounded-2xl p-8 border"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            borderColor: 'var(--color-border-glow)',
          }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code: ({ children, className }) => {
                const isInline = !className;
                if (isInline) {
                  return (
                    <code
                      className="px-1.5 py-0.5 rounded text-sm"
                      style={{
                        backgroundColor: 'var(--color-bg-secondary)',
                        color: 'var(--color-primary)',
                      }}
                    >
                      {children}
                    </code>
                  );
                }
                return <code className={className}>{children}</code>;
              },
              pre: ({ children }) => (
                <pre
                  className="p-4 rounded-xl overflow-x-auto my-4"
                  style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                >
                  {children}
                </pre>
              ),
              h1: ({ children }) => (
                <h1
                  className="text-2xl font-bold mb-4 mt-6"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2
                  className="text-xl font-bold mb-3 mt-5"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3
                  className="text-lg font-bold mb-2 mt-4"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p
                  className="mb-4 leading-relaxed"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul
                  className="mb-4 pl-5 list-disc"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol
                  className="mb-4 pl-5 list-decimal"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                  {children}
                </li>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {children}
                </strong>
              ),
              blockquote: ({ children }) => (
                <blockquote
                  className="border-l-4 pl-4 my-4 italic"
                  style={{
                    borderColor: 'var(--color-primary)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {children}
                </blockquote>
              ),
            }}
          >
            {article.content}
          </ReactMarkdown>
        </div>
      </motion.article>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="max-w-4xl mx-auto px-6 mt-8"
      >
        <div
          className="rounded-2xl p-6 border flex items-center justify-center gap-6"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            borderColor: 'var(--color-border-glow)',
          }}
        >
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleLike}
            className={cn(
              'flex items-center gap-2 px-6 py-3 rounded-xl transition-all',
              liked ? 'text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]' : '',
            )}
            style={{
              backgroundColor: liked ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
              color: liked ? '#fff' : 'var(--color-text-secondary)',
            }}
          >
            <ThumbsUp className={cn('w-5 h-5', liked && 'fill-current')} />
            <span className="font-semibold">{article.likes || 0}</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl transition-all"
            style={{
              backgroundColor: 'var(--color-bg-secondary)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <MessageCircle className="w-5 h-5" />
            <span>{comments.length}</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl transition-all"
            style={{
              backgroundColor: 'var(--color-bg-secondary)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <Share2 className="w-5 h-5" />
            <span>分享</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Comments Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="max-w-4xl mx-auto px-6 mt-8"
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
          评论 ({comments.length})
        </h3>

        {/* Comment Form */}
        <form onSubmit={handleCommentSubmit}>
          <textarea
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="写下你的评论..."
            className="w-full p-4 rounded-xl border resize-none"
            rows={3}
            style={{
              backgroundColor: 'var(--color-bg-card)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          />
          <button
            type="submit"
            disabled={createCommentMutation.isPending || !commentContent.trim()}
            className="mt-3 px-6 py-2 rounded-xl font-medium transition-all disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
          >
            {createCommentMutation.isPending ? '发表中...' : '发表评论'}
          </button>
        </form>

        {/* Comment List */}
        <div className="mt-6 space-y-4">
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl border"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{
                      background:
                        'linear-gradient(135deg, var(--color-gradient-start), var(--color-gradient-end))',
                    }}
                  >
                    {comment.user.nickname?.[0] || 'U'}
                  </div>
                  <div>
                    <div style={{ color: 'var(--color-text-primary)' }}>
                      {comment.user.nickname}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {new Date(comment.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                {user?.id === comment.user.id && (
                  <button
                    onClick={() => deleteCommentMutation.mutate(comment.id)}
                    className="p-2 rounded-lg transition-colors hover:bg-red-500/10"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="mt-3" style={{ color: 'var(--color-text-secondary)' }}>
                {comment.content}
              </p>
            </motion.div>
          ))}
          {comments.length === 0 && (
            <p className="text-center py-8" style={{ color: 'var(--color-text-secondary)' }}>
              暂无评论，来说点什么吧
            </p>
          )}
        </div>
      </motion.div>

      {/* Author Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="max-w-4xl mx-auto px-6 mt-8"
      >
        <div
          className="rounded-2xl p-6 border flex items-center gap-6"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            borderColor: 'var(--color-border-glow)',
          }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white font-medium text-xl overflow-hidden"
            style={{
              background:
                'linear-gradient(135deg, var(--color-gradient-start), var(--color-gradient-end))',
            }}
          >
            {article.author.avatar ? (
              <img
                src={getImageUrl(article.author.avatar)}
                alt={article.author.nickname || ''}
                className="w-full h-full object-cover"
              />
            ) : (
              article.author.nickname?.[0] || 'U'
            )}
          </div>
          <div className="flex-1">
            <div className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {article.author.nickname}
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              原创技术博主
            </div>
          </div>
          {user && user.id !== article.author.id && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => (isFollowing ? unfollowMutation.mutate() : followMutation.mutate())}
              className="px-6 py-2 rounded-xl font-medium transition-colors flex items-center gap-2"
              style={{
                backgroundColor: isFollowing ? 'var(--color-bg-secondary)' : 'var(--color-primary)',
                color: isFollowing ? 'var(--color-text-primary)' : '#fff',
                border: isFollowing ? '1px solid var(--color-border-glow)' : 'none',
              }}
            >
              {isFollowing ? (
                <>
                  <UserCheck className="w-4 h-4" />
                  已关注
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  关注
                </>
              )}
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
