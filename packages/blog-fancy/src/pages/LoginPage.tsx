import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { authApi } from '@/lib/auth-api';
import { useAuthStore } from '@/store/auth-store';

export function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset'>('login');
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    code: '',
    newPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setTokens, setUser } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const { data } = await authApi.login({ identifier: form.email, password: form.password });
        setTokens(data.accessToken, data.refreshToken);
        const profile = await authApi.getProfile();
        setUser(profile.data);
        navigate('/home');
      } else if (mode === 'register') {
        if (form.password !== form.confirmPassword) {
          setError('两次密码不一致');
          setLoading(false);
          return;
        }
        const { data } = await authApi.register({
          email: form.email,
          username: form.email.split('@')[0],
          password: form.password,
        });
        setTokens(data.accessToken, data.refreshToken);
        const profile = await authApi.getProfile();
        setUser(profile.data);
        navigate('/home');
      } else if (mode === 'forgot') {
        await authApi.forgotPassword(form.email);
        setMode('reset');
        setError('验证码已发送到邮箱，请查收');
      } else if (mode === 'reset') {
        await authApi.resetPassword(form.code, form.newPassword);
        setMode('login');
        setError('密码重置成功，请使用新密码登录');
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
    w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-all
    bg-[var(--color-bg-secondary)]
    border border-[var(--color-border-glow)]
    text-[var(--color-text-primary)]
    placeholder-[var(--color-text-secondary)]
    focus:outline-none focus:border-[var(--color-primary)]
  `;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--color-bg-primary)' }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: 'var(--color-primary)' }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: 'var(--color-accent)' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        <div className="text-center mb-8">
          <motion.div
            className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4"
            style={{
              background:
                'linear-gradient(135deg, var(--color-gradient-start), var(--color-gradient-end))',
            }}
            whileHover={{ scale: 1.05 }}
          >
            <span className="text-white font-bold text-2xl">B</span>
          </motion.div>
          <h1 className="text-3xl font-bold gradient-text">BlogFancy</h1>
          <p className="mt-2" style={{ color: 'var(--color-text-secondary)' }}>
            {mode === 'login' && '欢迎回来'}
            {mode === 'register' && '创建账号'}
            {mode === 'forgot' && '找回密码'}
            {mode === 'reset' && '重置密码'}
          </p>
        </div>

        <div className="glass rounded-2xl p-6" style={{ borderColor: 'var(--color-border-glow)' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {(mode === 'login' || mode === 'register' || mode === 'forgot') && (
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                  style={{ color: 'var(--color-text-secondary)' }}
                />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={inputClass}
                  placeholder="邮箱地址"
                  required
                />
              </div>
            )}

            {(mode === 'login' || mode === 'register') && (
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                  style={{ color: 'var(--color-text-secondary)' }}
                />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={inputClass}
                  placeholder="密码"
                  required
                />
              </div>
            )}

            {mode === 'register' && (
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                  style={{ color: 'var(--color-text-secondary)' }}
                />
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className={inputClass}
                  placeholder="确认密码"
                  required
                />
              </div>
            )}

            {mode === 'reset' && (
              <>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                    style={{ color: 'var(--color-text-secondary)' }}
                  />
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    className={inputClass}
                    placeholder="邮箱验证码（6位）"
                    maxLength={6}
                    required
                  />
                </div>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                    style={{ color: 'var(--color-text-secondary)' }}
                  />
                  <input
                    type="password"
                    value={form.newPassword}
                    onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                    className={inputClass}
                    placeholder="新密码"
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
              className="w-full py-3 rounded-xl text-white font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              style={{
                background:
                  'linear-gradient(135deg, var(--color-gradient-start), var(--color-gradient-end))',
              }}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
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
                  没有账号？立即注册
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
        </div>
      </motion.div>
    </div>
  );
}
