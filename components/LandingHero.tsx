'use client';

import { motion } from 'framer-motion';
import { Heart, Sparkles, Music } from 'lucide-react';
import Link from 'next/link';
import Logo from './Logo';

export default function LandingHero() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-16 sm:py-20">
      <div className="max-w-6xl mx-auto w-full space-y-8 sm:space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-4 sm:space-y-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center mb-6 sm:mb-8"
          >
            <Logo size="lg" showText={false} />
          </motion.div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-gradient leading-tight">
            为爱而歌
          </h1>

          <h2 className="text-xl sm:text-2xl md:text-4xl font-semibold text-white/90">
            AI情歌创作
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-pink-200 font-light flex items-center justify-center gap-2 flex-wrap">
            <Sparkles className="w-4 sm:w-5 h-4 sm:h-5" />
            星辰为证，歌声为誓
            <Sparkles className="w-4 sm:w-5 h-4 sm:h-5" />
          </p>

          <p className="text-sm sm:text-base text-white/70 max-w-2xl mx-auto px-4">
            用AI为你的爱情谱写专属旋律，让每一个难忘的瞬间都化作动人的歌声
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="flex justify-center px-4"
        >
          <Link href="/create" className="w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(236, 72, 153, 0.6)' }}
              whileTap={{ scale: 0.95 }}
              className="group relative w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full text-white text-lg sm:text-xl font-bold shadow-2xl overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-400"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.5 }}
              />
              <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
                开始创作我们的歌
                <Heart className="w-5 sm:w-6 h-5 sm:h-6 fill-current" />
              </span>
            </motion.button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto"
        >
          <motion.div
            whileHover={{ y: -8 }}
            className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-3 sm:space-y-4 border border-white/10 hover:border-pink-400/50 transition-all"
          >
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center">
              <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h3 className="text-lg sm:text-2xl font-bold text-white">讲述你们的故事</h3>
            <p className="text-sm sm:text-base text-white/70 leading-relaxed">
              分享最难忘的回忆和感动瞬间
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -8 }}
            className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-3 sm:space-y-4 border border-white/10 hover:border-purple-400/50 transition-all"
          >
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h3 className="text-lg sm:text-2xl font-bold text-white">AI创作专属歌词</h3>
            <p className="text-sm sm:text-base text-white/70 leading-relaxed">
              智能生成充满情感的歌词
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -8 }}
            className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-3 sm:space-y-4 border border-white/10 hover:border-purple-400/50 transition-all sm:col-span-2 md:col-span-1"
          >
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Music className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h3 className="text-lg sm:text-2xl font-bold text-white">生成独一无二的情歌</h3>
            <p className="text-sm sm:text-base text-white/70 leading-relaxed">
              拥有只属于你们的爱情之歌
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
