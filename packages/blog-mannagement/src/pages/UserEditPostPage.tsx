import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/lib/admin-api';
import { getImageUrl } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, X } from 'lucide-react';

export function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const { data: post, isLoading } = useQuery({
    queryKey: ['my', 'post', id],
    queryFn: () => userApi.getMyPost(Number(id)).then((res) => res.data),
    enabled: !!id,
  });

  const [form, setForm] = useState({
    title: '',
    summary: '',
    content: '',
    coverImage: '',
    category: '',
    tags: '',
    published: false,
  });

  useEffect(() => {
    if (post) {
      setForm({
        title: post.title,
        summary: post.summary || '',
        content: post.content,
        coverImage: post.coverImage || '',
        category: post.category,
        tags: Array.isArray(post.tags) ? post.tags.join(', ') : '',
        published: post.published,
      });
      if (post.coverImage) {
        setCoverPreview(getImageUrl(post.coverImage));
      }
    }
  }, [post]);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => userApi.uploadCover(file),
    onSuccess: (res) => {
      setForm((f) => ({ ...f, coverImage: res.data.url }));
      setUploading(false);
    },
    onError: () => setUploading(false),
  });

  const updateMutation = useMutation({
    mutationFn: (data: typeof form) =>
      userApi.updatePost(Number(id), {
        title: data.title,
        content: data.content,
        summary: data.summary,
        coverImage: data.coverImage,
        category: data.category,
        tags: data.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        published: data.published,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my', 'posts'] });
      navigate('/my-posts');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      uploadMutation.mutate(file);
      const reader = new FileReader();
      reader.onload = (ev) => setCoverPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(form);
  };

  if (isLoading) {
    return (
      <div className="text-center py-20" style={{ color: 'var(--color-text-secondary)' }}>
        加载中...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-20" style={{ color: 'var(--color-text-secondary)' }}>
        文章不存在或无权访问
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/my-posts')}
          className="p-2 rounded-lg transition-all hover:opacity-80"
          style={{
            backgroundColor: 'var(--color-bg-secondary)',
            color: 'var(--color-text-secondary)',
          }}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          编辑文章
        </h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            className="rounded-2xl p-6 border"
            style={{
              backgroundColor: 'var(--color-bg-card)',
              borderColor: 'var(--color-border-glow)',
            }}
          >
            <div className="space-y-4">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  标题
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border outline-none transition-all"
                  style={{
                    backgroundColor: 'var(--color-bg-secondary)',
                    borderColor: 'var(--color-border-glow)',
                    color: 'var(--color-text-primary)',
                  }}
                  placeholder="文章标题"
                  required
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  摘要
                </label>
                <textarea
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border outline-none transition-all resize-none"
                  style={{
                    backgroundColor: 'var(--color-bg-secondary)',
                    borderColor: 'var(--color-border-glow)',
                    color: 'var(--color-text-primary)',
                  }}
                  placeholder="文章摘要（可选）"
                  rows={2}
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  封面图片
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <div className="flex items-start gap-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex-shrink-0 w-32 h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all hover:border-solid"
                    style={{
                      borderColor: 'var(--color-border-glow)',
                      backgroundColor: 'var(--color-bg-secondary)',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {uploading ? (
                      <span className="text-sm">上传中...</span>
                    ) : (
                      <>
                        <Upload className="w-6 h-6" />
                        <span className="text-xs">上传图片</span>
                      </>
                    )}
                  </button>
                  {(coverPreview || form.coverImage) && (
                    <div className="relative flex-shrink-0">
                      <img
                        src={coverPreview || getImageUrl(form.coverImage)}
                        alt="封面预览"
                        className="w-32 h-32 rounded-xl object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setForm({ ...form, coverImage: '' });
                          setCoverPreview('');
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: '#ef4444', color: '#fff' }}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    分类
                  </label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border outline-none transition-all"
                    style={{
                      backgroundColor: 'var(--color-bg-secondary)',
                      borderColor: 'var(--color-border-glow)',
                      color: 'var(--color-text-primary)',
                    }}
                    placeholder="前端"
                    required
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    标签（逗号分隔）
                  </label>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border outline-none transition-all"
                    style={{
                      backgroundColor: 'var(--color-bg-secondary)',
                      borderColor: 'var(--color-border-glow)',
                      color: 'var(--color-text-primary)',
                    }}
                    placeholder="React, TypeScript"
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  内容（Markdown）
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border outline-none transition-all resize-none font-mono text-sm"
                  style={{
                    backgroundColor: 'var(--color-bg-secondary)',
                    borderColor: 'var(--color-border-glow)',
                    color: 'var(--color-text-primary)',
                  }}
                  placeholder="## 标题&#10;&#10;内容..."
                  rows={15}
                  required
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, published: !form.published })}
                  className="relative w-12 h-6 rounded-full transition-all"
                  style={{
                    backgroundColor: form.published
                      ? 'var(--color-primary)'
                      : 'var(--color-bg-secondary)',
                  }}
                >
                  <div
                    className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                    style={{ left: form.published ? '28px' : '4px' }}
                  />
                </button>
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {form.published ? '已发布' : '草稿'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-6 py-3 rounded-xl font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {updateMutation.isPending ? '保存中...' : '保存修改'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/my-posts')}
              className="px-6 py-3 rounded-xl font-medium transition-all hover:opacity-80"
              style={{
                backgroundColor: 'var(--color-bg-secondary)',
                color: 'var(--color-text-secondary)',
              }}
            >
              取消
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
