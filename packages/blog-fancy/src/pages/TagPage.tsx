import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';

export function TagPage() {
  const { tag } = useParams();

  return (
    <div className="min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20 text-center"
      >
        <div className="text-5xl md:text-6xl mb-4 md:mb-6">🏷️</div>
        <h1 className="text-2xl md:text-4xl font-bold gradient-text mb-4">#{tag}</h1>
        <p className="text-[#94a3b8] text-base md:text-lg">标签 "{tag}" 下的文章正在整理中...</p>
      </motion.div>
    </div>
  );
}
