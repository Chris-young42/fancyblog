import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera } from 'lucide-react';
import { useState, useRef } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { authApi } from '@/lib/auth-api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

type Mode = 'login' | 'register' | 'forgot' | 'reset';

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    code: '',
    newPassword: '',
  });
  const [avatar, setAvatar] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setTokens, setUser } = useAuthStore();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const { data } = await authApi.login({
          identifier: form.email,
          password: form.password,
        });
        setTokens(data.accessToken, data.refreshToken);
        const profile = await authApi.getProfile();
        setUser(profile.data);
        onClose();
      } else if (mode === 'register') {
        if (form.password !== form.confirmPassword) {
          setError('两次密码不一致');
          setLoading(false);
          return;
        }
        const { data } = await authApi.register({
          email: form.email,
          username: form.username,
          password: form.password,
          avatar: avatar || undefined,
        });
        setTokens(data.accessToken, data.refreshToken);
        const profile = await authApi.getProfile();
        setUser(profile.data);
        onClose();
      } else if (mode === 'forgot') {
        await authApi.forgotPassword?.(form.email);
        setMode('reset');
      } else if (mode === 'reset') {
        await authApi.resetPassword(form.code, form.newPassword);
        setMode('login');
        setError('密码已重置，请登录');
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message || '操作失败');
      } else {
        setError('操作失败');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `
    w-full px-4 py-3 rounded-xl text-sm transition-all
    bg-[var(--color-bg-secondary)]
    border border-[var(--color-border-glow)]
    text-[var(--color-text-primary)]
    placeholder-[var(--color-text-secondary)]
    focus:outline-none focus:border-[var(--color-primary)]
  `;

  const labelClass = 'block text-sm font-medium mb-2 text-[var(--color-text-secondary)]';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-md rounded-2xl p-6 relative"
            style={{ backgroundColor: 'var(--color-bg-card)' }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl transition-colors hover:opacity-70"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold mb-6 text-center gradient-text">
              {mode === 'login' && '登录'}
              {mode === 'register' && '注册'}
              {mode === 'forgot' && '找回密码'}
              {mode === 'reset' && '重置密码'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <>
                  <div>
                    <label className={labelClass}>邮箱</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className={inputClass}
                      placeholder="请输入邮箱"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>用户名</label>
                    <input
                      type="text"
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      className={inputClass}
                      placeholder="请输入用户名"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>头像（可选）</label>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-20 h-20 rounded-full overflow-hidden transition-all hover:scale-105"
                        style={{
                          border: '2px solid var(--color-border-glow)',
                          backgroundColor: 'var(--color-bg-secondary)',
                        }}
                      >
                        {avatar ? (
                          <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center"
                            style={{ color: 'var(--color-text-secondary)' }}
                          >
                            <Camera className="w-6 h-6" />
                          </div>
                        )}
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleAvatarChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        点击上传头像
                      </span>
                    </div>
                  </div>
                </>
              )}

              {(mode === 'login' || mode === 'register') && (
                <>
                  <div>
                    <label className={labelClass}>邮箱/用户名</label>
                    <input
                      type="text"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className={inputClass}
                      placeholder="请输入邮箱或用户名"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>密码</label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className={inputClass}
                      placeholder="请输入密码"
                      required
                    />
                  </div>
                </>
              )}

              {mode === 'register' && (
                <div>
                  <label className={labelClass}>确认密码</label>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    className={inputClass}
                    placeholder="请再次输入密码"
                    required
                  />
                </div>
              )}

              {mode === 'forgot' && (
                <div>
                  <label className={labelClass}>邮箱</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={inputClass}
                    placeholder="请输入注册邮箱"
                    required
                  />
                </div>
              )}

              {mode === 'reset' && (
                <>
                  <div>
                    <label className={labelClass}>验证码</label>
                    <input
                      type="text"
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value })}
                      className={inputClass}
                      placeholder="请输入6位验证码"
                      maxLength={6}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>新密码</label>
                    <input
                      type="password"
                      value={form.newPassword}
                      onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                      className={inputClass}
                      placeholder="请输入新密码"
                      required
                    />
                  </div>
                </>
              )}

              {error && (
                <p className="text-sm text-center" style={{ color: '#ef4444' }}>
                  {error}
                </p>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-xl text-white font-medium transition-all disabled:opacity-50"
                style={{
                  background:
                    'linear-gradient(135deg, var(--color-gradient-start), var(--color-gradient-end))',
                }}
              >
                {loading
                  ? '处理中...'
                  : (mode === 'login' && '登录') ||
                    (mode === 'register' && '注册') ||
                    (mode === 'forgot' && '发送验证码') ||
                    (mode === 'reset' && '重置密码')}
              </motion.button>
            </form>

            <div
              className="mt-4 text-center text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {mode === 'login' && (
                <>
                  <button onClick={() => setMode('forgot')} className="hover:underline mr-4">
                    忘记密码
                  </button>
                  <button onClick={() => setMode('register')} className="hover:underline">
                    注册账号
                  </button>
                </>
              )}
              {mode === 'register' && (
                <button onClick={() => setMode('login')} className="hover:underline">
                  已有账号？登录
                </button>
              )}
              {(mode === 'forgot' || mode === 'reset') && (
                <button onClick={() => setMode('login')} className="hover:underline">
                  返回登录
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
