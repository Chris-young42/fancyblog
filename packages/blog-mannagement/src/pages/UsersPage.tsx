import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, type User } from '@/lib/admin-api';
import { getImageUrl } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Trash2, Shield, UserX, UserCheck } from 'lucide-react';

export function UsersPage() {
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => adminApi.getUsers().then((res) => res.data),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { nickname?: string; role?: string; isActive?: boolean };
    }) => adminApi.updateUser(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
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
        用户管理
      </h1>

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
                用户
              </th>
              <th
                className="px-6 py-4 text-left text-sm font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                角色
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
                文章
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
            {users?.map((user: User) => (
              <tr key={user.id} className="hover:bg-[var(--color-bg-secondary)] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium overflow-hidden"
                      style={{
                        background:
                          'linear-gradient(135deg, var(--color-gradient-start), var(--color-gradient-end))',
                      }}
                    >
                      {user.avatar ? (
                        <img
                          src={getImageUrl(user.avatar)}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        user.nickname?.[0] || 'U'
                      )}
                    </div>
                    <div>
                      <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {user.nickname || user.username}
                      </div>
                      <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium"
                    style={{
                      backgroundColor:
                        user.role === 'admin'
                          ? 'rgba(99, 102, 241, 0.2)'
                          : 'rgba(34, 211, 238, 0.2)',
                      color: user.role === 'admin' ? '#6366f1' : '#22d3ee',
                    }}
                  >
                    <Shield className="w-3 h-3" />
                    {user.role === 'admin' ? '管理员' : '用户'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium"
                    style={{
                      backgroundColor: user.isActive
                        ? 'rgba(34, 197, 94, 0.2)'
                        : 'rgba(239, 68, 68, 0.2)',
                      color: user.isActive ? '#22c55e' : '#ef4444',
                    }}
                  >
                    {user.isActive ? (
                      <UserCheck className="w-3 h-3" />
                    ) : (
                      <UserX className="w-3 h-3" />
                    )}
                    {user.isActive ? '正常' : '禁用'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {user._count?.posts || 0} 篇
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateMutation.mutate({
                          id: user.id,
                          data: { role: user.role === 'admin' ? 'user' : 'admin' },
                        })
                      }
                      className="p-2 rounded-lg transition-all hover:opacity-80"
                      style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}
                      title={user.role === 'admin' ? '降为用户' : '升为管理员'}
                    >
                      <Shield className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        updateMutation.mutate({ id: user.id, data: { isActive: !user.isActive } })
                      }
                      className="p-2 rounded-lg transition-all hover:opacity-80"
                      style={{
                        backgroundColor: user.isActive
                          ? 'rgba(239, 68, 68, 0.1)'
                          : 'rgba(34, 197, 94, 0.1)',
                        color: user.isActive ? '#ef4444' : '#22c55e',
                      }}
                      title={user.isActive ? '禁用用户' : '启用用户'}
                    >
                      {user.isActive ? (
                        <UserX className="w-4 h-4" />
                      ) : (
                        <UserCheck className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('确定要删除该用户吗？')) deleteMutation.mutate(user.id);
                      }}
                      className="p-2 rounded-lg transition-all hover:opacity-80"
                      style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
                      title="删除用户"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
