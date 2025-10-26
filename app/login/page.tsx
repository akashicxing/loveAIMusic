/**
 * 登录页面
 * 仅支持微信登录
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import RomanticBackground from '@/components/RomanticBackground';
import WeChatLogin from '@/components/WeChatLogin';
import MiniProgramLogin from '@/components/MiniProgramLogin';
import Logo from '@/components/Logo';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 检查是否已登录
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      router.push('/');
    }
  }, [router]);

  const handleWeChatLoginSuccess = (user: any) => {
    setSuccess('微信登录成功！');
    setTimeout(() => {
      router.push('/');
    }, 1500);
  };

  const handleWeChatLoginError = (error: string) => {
    setError(error);
  };

  const handleMiniProgramLoginSuccess = (user: any) => {
    setSuccess('微信小程序登录成功！');
    setTimeout(() => {
      router.push('/');
    }, 1500);
  };

  const handleMiniProgramLoginError = (error: string) => {
    setError(error);
  };

  return (
    <div className="min-h-screen relative">
      <RomanticBackground />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <Logo size="lg" showText={true} />
          </div>

          {/* 登录卡片 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-2xl"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">欢迎回来</h1>
              <p className="text-pink-200">使用微信登录，继续创作专属情歌</p>
            </div>

            {/* 错误/成功提示 */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm"
              >
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-200 text-sm"
              >
                {success}
              </motion.div>
            )}

            {/* 微信登录 */}
                   <div className="mt-6 space-y-4">
                     <WeChatLogin
                       onLoginSuccess={handleWeChatLoginSuccess}
                       onLoginError={handleWeChatLoginError}
                       size="lg"
                       variant="default"
                       showText={true}
                     />
                     <div className="text-center text-pink-200 text-sm">
                       或
                     </div>
                     <MiniProgramLogin
                       onLoginSuccess={handleMiniProgramLoginSuccess}
                       onLoginError={handleMiniProgramLoginError}
                       size="lg"
                       variant="outline"
                       showText={true}
                     />
                   </div>

            {/* 提示信息 */}
            <div className="mt-6 text-center">
              <p className="text-pink-200 text-sm">
                首次使用微信登录将自动创建账户
              </p>
            </div>
          </motion.div>

          {/* 返回首页 */}
          <div className="text-center mt-6">
            <button
              onClick={() => router.push('/')}
              className="text-pink-300 hover:text-white transition-colors text-sm"
            >
              ← 返回首页
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
