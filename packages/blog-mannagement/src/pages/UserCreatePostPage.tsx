import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { userApi } from '@/lib/admin-api';
import { getImageUrl } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, X } from 'lucide-react';

export function CreatePostPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    summary: '',
    content: '',
    coverImage: '',
    category: '',
    tags: '',
    published: false,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => userApi.uploadCover(file),
    onSuccess: (res) => {
      setForm({ ...form, coverImage: res.data.url });
      setUploading(false);
    },
    onError: () => setUploading(false),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) =>
      userApi.createPost({
        ...data,
        tags: data.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      }),
    onSuccess: () => navigate('/my-posts'),
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
    createMutation.mutate(form);
  };

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
          创建文章
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
                  placeholder="## 标题"
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
                  {form.published ? '立即发布' : '存为草稿'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-6 py-3 rounded-xl font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {createMutation.isPending ? '创建中...' : '创建文章'}
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
