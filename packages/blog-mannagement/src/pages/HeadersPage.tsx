import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, type HeaderNav } from '@/lib/admin-api';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { Plus, Trash2, GripVertical, Check, X } from 'lucide-react';

/** 与前台 blog-fancy Navbar 中分类链接规则一致 */
function pathFromCategory(category: string): string {
  const c = category.trim();
  if (!c) return '';
  return `/category/${encodeURIComponent(c)}`;
}

const HOME_TAB_PRESETS: { label: string; path: string }[] = [
  { label: '首页 · 全部', path: '/home/all' },
  { label: '首页 · 热门', path: '/home/hot' },
  { label: '首页 · 最新', path: '/home/new' },
  { label: '首页 · 推荐', path: '/home/recommend' },
  { label: '首页 · 专栏', path: '/home/column' },
];

export function HeadersPage() {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({ label: '', path: '', category: '' });

  const { data: categoryRows } = useQuery({
    queryKey: ['blog', 'categories'],
    queryFn: () => api.get<{ category: string }[]>('/blog/categories').then((res) => res.data),
    enabled: isCreating,
  });

  const { data: headers, isLoading } = useQuery({
    queryKey: ['admin', 'headers'],
    queryFn: () => adminApi.getHeaders().then((res) => res.data.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) =>
      adminApi.createHeader({
        ...data,
        order: (headers?.length || 0) + 1,
        isActive: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'headers'] });
      setIsCreating(false);
      setForm({ label: '', path: '', category: '' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<HeaderNav> }) =>
      adminApi.updateHeader(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'headers'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteHeader(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'headers'] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

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
          导航管理
        </h1>
        <button
          onClick={() => {
            setForm({ label: '', path: '', category: '' });
            setIsCreating(true);
          }}
          className="px-4 py-2 rounded-xl font-medium text-white transition-all hover:opacity-90"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          <Plus className="w-5 h-5 inline mr-1" /> 添加导航
        </button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-2xl p-5 border"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            borderColor: 'var(--color-border-glow)',
          }}
        >
          <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            添加导航
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  常用前台路由
                </label>
                <select
                  value=""
                  onChange={(e) => {
                    const path = e.target.value;
                    if (!path) return;
                    setForm((f) => ({ ...f, path, category: '' }));
                  }}
                  className="w-full px-3 py-2 rounded-lg border outline-none"
                  style={{
                    backgroundColor: 'var(--color-bg-secondary)',
                    borderColor: 'var(--color-border-glow)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  <option value="">选择后自动填写路径（首页各 Tab）</option>
                  {HOME_TAB_PRESETS.map((p) => (
                    <option key={p.path} value={p.path}>
                      {p.label} → {p.path}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  从已有分类生成
                </label>
                <select
                  value=""
                  onChange={(e) => {
                    const cat = e.target.value;
                    if (!cat) return;
                    setForm((f) => ({
                      ...f,
                      category: cat,
                      path: pathFromCategory(cat),
                      label: f.label.trim() ? f.label : cat,
                    }));
                  }}
                  className="w-full px-3 py-2 rounded-lg border outline-none"
                  style={{
                    backgroundColor: 'var(--color-bg-secondary)',
                    borderColor: 'var(--color-border-glow)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  <option value="">选择分类后自动填路径与关联分类</option>
                  {categoryRows?.map((row) => (
                    <option key={row.category} value={row.category}>
                      {row.category} → {pathFromCategory(row.category)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              填写「关联分类」时，路径会与前台导航一致，自动设为{' '}
              <code className="text-[11px]">/category/…</code>；选首页 Tab 时会清空关联分类。
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  标签
                </label>
                <input
                  type="text"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border outline-none"
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
                  className="block text-sm font-medium mb-1"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  路径
                </label>
                <input
                  type="text"
                  value={form.path}
                  onChange={(e) => setForm({ ...form, path: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border outline-none"
                  style={{
                    backgroundColor: 'var(--color-bg-secondary)',
                    borderColor: 'var(--color-border-glow)',
                    color: 'var(--color-text-primary)',
                  }}
                  placeholder="/category/frontend 或 /home/hot"
                  required
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  关联分类（可选）
                </label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => {
                    const category = e.target.value;
                    setForm((f) => {
                      const next = { ...f, category };
                      if (category.trim()) {
                        next.path = pathFromCategory(category);
                      }
                      return next;
                    });
                  }}
                  className="w-full px-3 py-2 rounded-lg border outline-none"
                  style={{
                    backgroundColor: 'var(--color-bg-secondary)',
                    borderColor: 'var(--color-border-glow)',
                    color: 'var(--color-text-primary)',
                  }}
                  placeholder="与文章分类一致，如：前端"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-4 py-2 rounded-lg font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {createMutation.isPending ? '创建中...' : '创建'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setForm({ label: '', path: '', category: '' });
                }}
                className="px-4 py-2 rounded-lg font-medium transition-all hover:opacity-80"
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
      )}

      {/* Headers List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl border overflow-hidden"
        style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border-glow)' }}
      >
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
              <th
                className="px-6 py-4 text-left text-sm font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                排序
              </th>
              <th
                className="px-6 py-4 text-left text-sm font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                标签
              </th>
              <th
                className="px-6 py-4 text-left text-sm font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                路径
              </th>
              <th
                className="px-6 py-4 text-left text-sm font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                关联分类
              </th>
              <th
                className="px-6 py-4 text-left text-sm font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                状态
              </th>
              <th
                className="px-6 py-4 text-left text-sm font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--color-border-glow)' }}>
            {headers?.map((header: HeaderNav) => (
              <tr
                key={header.id}
                className="hover:bg-bg-secondary transition-colors"
              >
                <td className="px-6 py-4">
                  <GripVertical
                    className="w-4 h-4 cursor-move"
                    style={{ color: 'var(--color-text-secondary)' }}
                  />
                </td>
                <td
                  className="px-6 py-4 font-medium"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {header.label}
                </td>
                <td className="px-6 py-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {header.path}
                </td>
                <td className="px-6 py-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {header.category || '-'}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() =>
                      updateMutation.mutate({ id: header.id, data: { isActive: !header.isActive } })
                    }
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium"
                    style={{
                      backgroundColor: header.isActive
                        ? 'rgba(34, 197, 94, 0.2)'
                        : 'rgba(239, 68, 68, 0.2)',
                      color: header.isActive ? '#22c55e' : '#ef4444',
                    }}
                  >
                    {header.isActive ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    {header.isActive ? '启用' : '禁用'}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => deleteMutation.mutate(header.id)}
                      className="p-2 rounded-lg transition-all hover:opacity-80"
                      style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!headers || headers.length === 0) && (
          <div className="text-center py-12" style={{ color: 'var(--color-text-secondary)' }}>
            暂无导航配置
          </div>
        )}
      </motion.div>
    </div>
  );
}
