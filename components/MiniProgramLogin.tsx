'use client';

import { useState } from 'react';
import { MessageCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface MiniProgramLoginProps {
  onLoginSuccess: (user: any) => void;
  onLoginError: (error: string) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  showText?: boolean;
}

export default function MiniProgramLogin({
  onLoginSuccess,
  onLoginError,
  size = 'md',
  variant = 'default',
  showText = true
}: MiniProgramLoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSDKReady, setIsSDKReady] = useState(false);

  // 尺寸配置
  const sizeConfig = {
    sm: { button: 'px-4 py-2 text-sm', icon: 'w-4 h-4' },
    md: { button: 'px-6 py-3 text-base', icon: 'w-5 h-5' },
    lg: { button: 'px-8 py-4 text-lg', icon: 'w-6 h-6' }
  };

  const currentSize = sizeConfig[size];

  // 按钮样式
  const getButtonClasses = () => {
    const baseClasses = `${currentSize.button} rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2`;
    
    switch (variant) {
      case 'outline':
        return `${baseClasses} border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white`;
      case 'ghost':
        return `${baseClasses} text-green-500 hover:bg-green-500/10`;
      default:
        return `${baseClasses} bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl`;
    }
  };

  // 检查微信环境
  const checkWeChatEnvironment = () => {
    return /MicroMessenger/i.test(navigator.userAgent);
  };

  // 拉起小程序登录
  const handleMiniProgramLogin = async () => {
    if (!checkWeChatEnvironment()) {
      onLoginError('请在微信中打开此页面');
      return;
    }

    setIsLoading(true);

    try {
      // 检查微信JS-SDK是否加载
      if (typeof window !== 'undefined' && (window as any).wx) {
        const wx = (window as any).wx;
        
        // 拉起小程序
        wx.miniProgram.navigateTo({
          url: '/pages/login/login?redirect=' + encodeURIComponent(window.location.href),
          success: (res: any) => {
            console.log('✅ 小程序拉起成功:', res);
          },
          fail: (err: any) => {
            console.error('❌ 小程序拉起失败:', err);
            onLoginError('拉起小程序失败，请重试');
            setIsLoading(false);
          }
        });
      } else {
        onLoginError('微信环境未准备好，请刷新页面重试');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('❌ 小程序登录错误:', error);
      onLoginError('登录失败，请重试');
      setIsLoading(false);
    }
  };

  // 监听小程序返回的消息
  const handleMessage = (event: MessageEvent) => {
    if (event.data && event.data.type === 'WECHAT_LOGIN_SUCCESS') {
      const userInfo = event.data.user;
      onLoginSuccess(userInfo);
      setIsLoading(false);
    } else if (event.data && event.data.type === 'WECHAT_LOGIN_ERROR') {
      onLoginError(event.data.error || '登录失败');
      setIsLoading(false);
    }
  };

  // 组件挂载时添加消息监听
  useState(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }
  });

  // 检查SDK状态
  useState(() => {
    if (typeof window !== 'undefined' && (window as any).wx) {
      setIsSDKReady(true);
    }
  });

  return (
    <div className="relative">
      <button
        onClick={handleMiniProgramLogin}
        disabled={isLoading || !isSDKReady}
        className={getButtonClasses()}
      >
        {isLoading ? (
          <Loader2 className={`${currentSize.icon} animate-spin`} />
        ) : (
          <MessageCircle className={currentSize.icon} />
        )}
        {showText && (isLoading ? '登录中...' : '微信小程序登录')}
      </button>
      
      {isSDKReady && (
        <div className="mt-2 text-xs text-green-500 flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          微信小程序SDK已就绪
        </div>
      )}
    </div>
  );
}
