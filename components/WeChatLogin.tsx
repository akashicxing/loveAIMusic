/**
 * 微信登录组件
 * 支持PC端微信登录和PC OpenSDK功能
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Loader2, CheckCircle, XCircle } from 'lucide-react';

// 声明全局wxopensdk类型
declare global {
  interface Window {
    wxopensdk?: {
      ready: boolean;
      onReady: (callback: () => void) => void;
      launchMiniProgram: (options: {
        appid: string;
        userName: string;
        path: string;
        ticket: string;
        timeout?: number;
      }) => Promise<{
        errcode: number;
        errmsg: string;
        actionId: string;
      }>;
      shareMiniProgram: (options: {
        appid: string;
        userName: string;
        path: string;
        ticket: string;
        title: string;
        desc: string;
        linkUrl: string;
        imgUrl: string;
        timeout?: number;
      }) => Promise<{
        errcode: number;
        errmsg: string;
        actionId: string;
      }>;
    };
  }
}

interface WeChatLoginProps {
  onLoginSuccess?: (user: any) => void;
  onLoginError?: (error: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  showText?: boolean;
}

interface WeChatConfig {
  appId: string;
  redirectUri: string;
  isConfigured: boolean;
}

export default function WeChatLogin({
  onLoginSuccess,
  onLoginError,
  className = '',
  size = 'md',
  variant = 'default',
  showText = true
}: WeChatLoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSDKReady, setIsSDKReady] = useState(false);
  const [config, setConfig] = useState<WeChatConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastCallTime, setLastCallTime] = useState<number>(0);
  const [callCount, setCallCount] = useState<number>(0);

  // 尺寸配置
  const sizeConfig = {
    sm: { icon: 16, text: 'text-sm', padding: 'px-3 py-2' },
    md: { icon: 20, text: 'text-base', padding: 'px-4 py-2' },
    lg: { icon: 24, text: 'text-lg', padding: 'px-6 py-3' }
  };

  const currentSize = sizeConfig[size];

  // 检查频率限制
  const checkRateLimit = (): boolean => {
    const now = Date.now();
    const timeDiff = now - lastCallTime;
    
    // 重置计数器（每分钟）
    if (timeDiff > 60000) {
      setCallCount(0);
    }
    
    // 检查频率限制
    if (timeDiff < 1000 && callCount >= 1) {
      setError('操作过于频繁，请稍后再试');
      return false;
    }
    
    if (timeDiff < 60000 && callCount >= 5) {
      setError('操作次数过多，请稍后再试');
      return false;
    }
    
    return true;
  };

  // 更新调用统计
  const updateCallStats = () => {
    const now = Date.now();
    setLastCallTime(now);
    setCallCount(prev => prev + 1);
  };

  // 加载微信配置
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/api/auth/wechat');
        const result = await response.json();
        
        if (result.success) {
          setConfig(result.data);
        } else {
          setError('微信登录配置加载失败');
        }
      } catch (err) {
        console.error('加载微信配置失败:', err);
        setError('网络连接失败');
      }
    };

    loadConfig();
  }, []);

  // 加载PC OpenSDK
  useEffect(() => {
    if (!config?.isConfigured) return;

    const loadSDK = () => {
      if ((window as any).wxopensdk) {
        setIsSDKReady(true);
        return;
      }

      // 检查是否已经加载过SDK
      const existingScript = document.querySelector('script[src*="wxopensdk.js"]');
      if (existingScript) {
        // 如果脚本已存在但SDK未就绪，等待其加载
        if ((window as any).wxopensdk?.ready) {
          setIsSDKReady(true);
        } else {
          (window as any).wxopensdk?.onReady(() => {
            setIsSDKReady(true);
          });
        }
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://res.wx.qq.com/connect/zh_CN/htmledition/js/wxopensdk.js';
      script.async = true;
      script.crossOrigin = 'anonymous';
      
      script.onload = () => {
        console.log('✅ [WeChat SDK] PC OpenSDK脚本加载成功');
        
        // 等待SDK初始化
        const checkSDKReady = () => {
          if ((window as any).wxopensdk?.ready) {
            console.log('✅ [WeChat SDK] PC OpenSDK已就绪');
            setIsSDKReady(true);
          } else if ((window as any).wxopensdk?.onReady) {
            (window as any).wxopensdk.onReady(() => {
              console.log('✅ [WeChat SDK] PC OpenSDK通过onReady回调就绪');
              setIsSDKReady(true);
            });
          } else {
            // 如果SDK对象存在但ready状态未知，稍后重试
            setTimeout(checkSDKReady, 100);
          }
        };
        
        checkSDKReady();
      };
      
      script.onerror = (error) => {
        console.error('❌ [WeChat SDK] PC OpenSDK脚本加载失败:', error);
        setError('微信SDK加载失败，请检查网络连接');
      };
      
      document.head.appendChild(script);
    };

    loadSDK();
  }, [config]);

  // 处理微信登录
  const handleWeChatLogin = useCallback(async () => {
    if (!config?.isConfigured) {
      onLoginError?.('微信登录未配置');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 生成state参数
      const state = `wechat_login_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 跳转到微信授权页面
      const authUrl = `https://open.weixin.qq.com/connect/qrconnect?appid=${config.appId}&redirect_uri=${encodeURIComponent(config.redirectUri)}&response_type=code&scope=snsapi_login&state=${state}#wechat_redirect`;
      
      // 在新窗口打开授权页面
      const authWindow = window.open(
        authUrl,
        'wechat_auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      // 监听授权结果
      const checkAuthResult = () => {
        if (authWindow?.closed) {
          setIsLoading(false);
          return;
        }

        try {
          // 检查是否有授权结果（通过localStorage或postMessage）
          const authResult = localStorage.getItem('wechat_auth_result');
          if (authResult) {
            localStorage.removeItem('wechat_auth_result');
            authWindow?.close();
            
            const result = JSON.parse(authResult);
            if (result.success) {
              onLoginSuccess?.(result.data.user);
            } else {
              onLoginError?.(result.error || '微信登录失败');
            }
            setIsLoading(false);
          } else {
            // 继续检查
            setTimeout(checkAuthResult, 1000);
          }
        } catch (err) {
          console.error('检查授权结果失败:', err);
          setTimeout(checkAuthResult, 1000);
        }
      };

      checkAuthResult();

    } catch (err) {
      console.error('微信登录失败:', err);
      onLoginError?.('微信登录失败');
      setIsLoading(false);
    }
  }, [config, onLoginSuccess, onLoginError]);

  // 获取PC OpenSDK ticket
  const getPCTicket = useCallback(async (userId: string, token: string) => {
    try {
      const response = await fetch(`/api/auth/wechat/ticket?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      return result.success ? result.data : null;
    } catch (err) {
      console.error('获取PC ticket失败:', err);
      return null;
    }
  }, []);

  // 启动PC小程序
  const launchMiniProgram = useCallback(async (userName: string, path: string = '', ticket?: string) => {
    if (!isSDKReady || !(window as any).wxopensdk) {
      throw new Error('微信SDK未就绪');
    }

    if (!ticket) {
      throw new Error('缺少ticket参数');
    }

    // 检查频率限制
    if (!checkRateLimit()) {
      throw new Error('操作过于频繁，请稍后再试');
    }

    try {
      updateCallStats();
      console.log('🚀 [WeChat SDK] 启动PC小程序:', { userName, path });
      
      const result = await (window as any).wxopensdk.launchMiniProgram({
        appid: config?.appId || '',
        userName,
        path,
        ticket,
        timeout: 10000
      });

      // 处理返回结果
      if (result.errcode === 0) {
        console.log('✅ [WeChat SDK] 启动PC小程序成功:', result);
        return result;
      } else {
        console.error('❌ [WeChat SDK] 启动PC小程序失败:', result);
        throw new Error(`启动失败: ${result.errmsg} (错误码: ${result.errcode})`);
      }
    } catch (error) {
      console.error('❌ [WeChat SDK] 启动PC小程序异常:', error);
      throw error;
    }
  }, [isSDKReady, config, checkRateLimit, updateCallStats]);

  // 分享PC小程序
  const shareMiniProgram = useCallback(async (userName: string, path: string, title: string, desc: string, linkUrl: string, imgUrl: string, ticket?: string) => {
    if (!isSDKReady || !(window as any).wxopensdk) {
      throw new Error('微信SDK未就绪');
    }

    if (!ticket) {
      throw new Error('缺少ticket参数');
    }

    // 检查频率限制
    if (!checkRateLimit()) {
      throw new Error('操作过于频繁，请稍后再试');
    }

    try {
      updateCallStats();
      console.log('📤 [WeChat SDK] 分享PC小程序:', { userName, path, title });
      
      const result = await (window as any).wxopensdk.shareMiniProgram({
        appid: config?.appId || '',
        userName,
        path,
        ticket,
        title,
        desc,
        linkUrl,
        imgUrl,
        timeout: 10000
      });

      // 处理返回结果
      if (result.errcode === 0) {
        console.log('✅ [WeChat SDK] 分享PC小程序成功:', result);
        return result;
      } else {
        console.error('❌ [WeChat SDK] 分享PC小程序失败:', result);
        throw new Error(`分享失败: ${result.errmsg} (错误码: ${result.errcode})`);
      }
    } catch (error) {
      console.error('❌ [WeChat SDK] 分享PC小程序异常:', error);
      throw error;
    }
  }, [isSDKReady, config, checkRateLimit, updateCallStats]);

  // 按钮样式
  const getButtonClasses = () => {
    const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantClasses = {
      default: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
      outline: 'border-2 border-green-600 text-green-600 hover:bg-green-50 focus:ring-green-500',
      ghost: 'text-green-600 hover:bg-green-50 focus:ring-green-500'
    };

    return `${baseClasses} ${currentSize.padding} ${currentSize.text} ${variantClasses[variant]} ${className}`;
  };

  if (!config?.isConfigured) {
    return (
      <button
        disabled
        className={`${getButtonClasses()} opacity-50 cursor-not-allowed`}
      >
        <MessageCircle className={`w-${currentSize.icon} h-${currentSize.icon} mr-2`} />
        {showText && '微信登录未配置'}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleWeChatLogin}
        disabled={isLoading}
        className={getButtonClasses()}
      >
        {isLoading ? (
          <Loader2 className={`w-${currentSize.icon} h-${currentSize.icon} mr-2 animate-spin`} />
        ) : (
          <MessageCircle className={`w-${currentSize.icon} h-${currentSize.icon} mr-2`} />
        )}
        {showText && (isLoading ? '登录中...' : '微信登录')}
      </button>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-2 p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
        >
          <div className="flex items-center">
            <XCircle className="w-4 h-4 mr-2" />
            {error}
          </div>
        </motion.div>
      )}

      {isSDKReady && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-full left-0 right-0 mt-2 p-2 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm"
        >
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            PC微信SDK已就绪
          </div>
        </motion.div>
      )}
    </div>
  );
}

// 导出工具函数
export { WeChatLogin };
export type { WeChatLoginProps };
