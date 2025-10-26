'use client';

import { motion } from 'framer-motion';
import { Heart, Sparkles } from 'lucide-react';
import Image from 'next/image';

export default function RomanticBackground() {
  const hearts = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    size: Math.random() * 20 + 10,
    left: Math.random() * 100,
    delay: Math.random() * 5,
    duration: Math.random() * 10 + 15,
  }));

  const stars = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 3,
  }));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* 背景图片层 - 模糊效果 */}
      <div className="absolute inset-0">
        <Image
          src="/bj.png"
          alt="Romantic Background"
          fill
          className="object-cover blur-sm"
          style={{ filter: 'blur(8px)' }}
          quality={90}
          priority
        />
        {/* 深色遮罩层，让文字更易读 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-purple-900/30 to-pink-900/40" />
      </div>

      {/* 保留原有渐变背景作为补充 */}
      <div className="absolute inset-0 bg-romantic opacity-30" />

      {stars.map((star) => (
        <motion.div
          key={`star-${star.id}`}
          className="absolute rounded-full bg-white"
          style={{
            width: star.size,
            height: star.size,
            left: `${star.left}%`,
            top: `${star.top}%`,
          }}
          animate={{
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: star.delay,
          }}
        />
      ))}

      {hearts.map((heart) => (
        <motion.div
          key={`heart-${heart.id}`}
          className="absolute text-pink-400/30"
          style={{
            left: `${heart.left}%`,
            fontSize: heart.size,
          }}
          initial={{ bottom: -50, opacity: 0 }}
          animate={{
            bottom: '110%',
            opacity: [0, 0.6, 0],
            x: [0, 30, -20, 0],
          }}
          transition={{
            duration: heart.duration,
            repeat: Infinity,
            delay: heart.delay,
            ease: 'easeInOut',
          }}
        >
          <Heart fill="currentColor" />
        </motion.div>
      ))}

      <div className="absolute top-20 left-10 animate-float">
        <Sparkles className="w-8 h-8 text-purple-400/40" />
      </div>
      <div className="absolute top-40 right-20 animate-float" style={{ animationDelay: '2s' }}>
        <Sparkles className="w-6 h-6 text-pink-400/40" />
      </div>
      <div className="absolute bottom-40 left-1/4 animate-float" style={{ animationDelay: '1s' }}>
        <Sparkles className="w-7 h-7 text-purple-300/40" />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-pink-900/20" />
    </div>
  );
}
