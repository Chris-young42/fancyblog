import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '@/store/theme-store';

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-xl overflow-hidden transition-all hover:scale-105"
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-glow)',
      }}
      aria-label={isDark ? '切换到浅色模式' : '切换到深色模式'}
    >
      <div className="relative w-5 h-5">
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ rotate: -90, scale: 0, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Moon className="w-5 h-5" style={{ color: '#6366f1' }} />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ rotate: 90, scale: 0, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: -90, scale: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Sun className="w-5 h-5" style={{ color: '#f97316' }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Background glow effect */}
      <motion.div
        className="absolute top-auto left-auto right-0 bottom-0 h-full w-full rounded-xl"
        animate={{
          boxShadow: isDark
            ? '0 0 20px rgba(99, 102, 241, 0.3)'
            : '0 0 20px rgba(249, 115, 22, 0.3)',
        }}
        transition={{ duration: 0.5 }}
      />
    </button>
  );
}
