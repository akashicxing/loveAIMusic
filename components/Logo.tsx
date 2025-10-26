'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export default function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl'
  };

  return (
    <Link href="/" className={`flex items-center gap-2 sm:gap-3 group ${className}`}>
      <motion.div
        whileHover={{ 
          scale: 1.1,
          rotate: [0, -5, 5, -5, 0]
        }}
        transition={{ 
          scale: { duration: 0.2 },
          rotate: { duration: 0.6 }
        }}
        className="relative"
      >
        {/* Logo图片 */}
        <div className={`${sizeClasses[size]} relative overflow-hidden rounded-xl`}>
          <Image
            src="/aimusic_logo_1.png"
            alt="AI Love Music Logo"
            fill
            className="object-cover"
            priority
          />
          
          {/* 发光效果 */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-pink-400/20 via-purple-400/20 to-pink-400/20 rounded-xl"
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        {/* 脉冲光环效果 */}
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-pink-400/30"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      {showText && (
        <div className="flex flex-col">
          <motion.span 
            className={`${textSizeClasses[size]} font-bold text-gradient leading-tight`}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            为爱而歌
          </motion.span>
          <motion.span 
            className="text-[10px] sm:text-xs text-pink-200/60 font-light tracking-wider"
            initial={{ opacity: 0.7 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            AI Love Song Creator
          </motion.span>
        </div>
      )}
    </Link>
  );
}
