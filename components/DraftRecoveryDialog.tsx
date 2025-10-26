'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Trash2, ArrowRight } from 'lucide-react';

interface DraftRecoveryDialogProps {
  show: boolean;
  lastSaved: number;
  onContinue: () => void;
  onStartFresh: () => void;
}

export default function DraftRecoveryDialog({
  show,
  lastSaved,
  onContinue,
  onStartFresh,
}: DraftRecoveryDialogProps) {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onStartFresh}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 px-4"
          >
            <div
              className="glass-card rounded-3xl p-8 md:p-12 max-w-md w-full space-y-6 shadow-2xl glow-pink"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center space-y-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-flex p-4 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-400/30"
                >
                  <Clock className="w-12 h-12 text-pink-400" />
                </motion.div>

                <h2 className="text-3xl font-bold text-white">
                  发现未完成的创作
                </h2>

                <p className="text-lg text-pink-200">
                  上次保存于 {formatTime(lastSaved)}
                </p>
              </div>

              <div className="space-y-3 pt-4">
                <motion.button
                  onClick={onContinue}
                  className="w-full px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 text-white text-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  继续创作
                  <ArrowRight className="w-5 h-5" />
                </motion.button>

                <motion.button
                  onClick={onStartFresh}
                  className="w-full px-8 py-4 rounded-2xl bg-white/10 text-white text-lg font-medium hover:bg-white/20 transition-all flex items-center justify-center gap-3"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Trash2 className="w-5 h-5" />
                  重新开始
                </motion.button>
              </div>

              <p className="text-center text-sm text-white/50 pt-2">
                重新开始将清空所有已保存的答案
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
