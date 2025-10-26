/**
 * 微信登录回调页面
 * 处理微信授权回调，完成登录流程
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, XCircle, Heart } from 'lucide-react';

export default function WeChatCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('正在处理微信登录...');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
          setStatus('error');
          setMessage(`微信登录失败: ${error}`);
          return;
        }

        if (!code) {
          setStatus('error');
          setMessage('未收到微信授权码');
          return;
        }

        setMessage('正在验证微信授权...');

        // 调用后端API处理微信登录
        const response = await fetch('/api/auth/wechat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            state
          }),
        });

        const result = await response.json();

        if (result.success) {
          setStatus('success');
          setMessage('微信登录成功！');
          setUser(result.data.user);

          // 保存登录信息到localStorage
          localStorage.setItem('auth_token', result.data.token);
          localStorage.setItem('user_info', JSON.stringify(result.data.user));
          localStorage.setItem('login_type', result.data.loginType);

          // 通知父窗口登录成功
          if (window.opener) {
            localStorage.setItem('wechat_auth_result', JSON.stringify({
              success: true,
              data: result.data
            }));
            window.close();
          } else {
            // 直接跳转到首页
            setTimeout(() => {
              router.push('/');
            }, 2000);
          }
        } else {
          setStatus('error');
          setMessage(result.error || '微信登录失败');
        }
      } catch (error) {
        console.error('微信登录回调处理失败:', error);
        setStatus('error');
        setMessage('网络连接失败，请重试');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-16 h-16 text-pink-400 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-400" />;
      case 'error':
        return <XCircle className="w-16 h-16 text-red-400" />;
      default:
        return <Loader2 className="w-16 h-16 text-pink-400 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'text-pink-300';
      case 'success':
        return 'text-green-300';
      case 'error':
        return 'text-red-300';
      default:
        return 'text-pink-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full text-center shadow-xl border border-white/20"
      >
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex justify-center">
            <Heart className="w-12 h-12 text-pink-400 fill-pink-400" />
          </div>

          {/* 状态图标 */}
          <div className="flex justify-center">
            {getStatusIcon()}
          </div>

          {/* 状态消息 */}
          <div className="space-y-2">
            <h2 className={`text-xl font-semibold ${getStatusColor()}`}>
              {message}
            </h2>
            
            {status === 'success' && user && (
              <div className="text-sm text-gray-600">
                <p>欢迎回来，{user.nickname}！</p>
                <p className="text-xs text-gray-500 mt-1">
                  VIP等级: {user.vipLevel === 'free' ? '免费用户' : user.vipLevel === 'trial' ? '试用VIP' : 'VIP用户'}
                </p>
              </div>
            )}

            {status === 'error' && (
              <div className="text-sm text-gray-600">
                <p>请检查网络连接后重试</p>
              </div>
            )}
          </div>

          {/* 加载动画 */}
          {status === 'loading' && (
            <div className="space-y-2">
              <div className="flex justify-center space-x-1">
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          )}

          {/* 成功后的操作 */}
          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-3"
            >
              <p className="text-sm text-gray-600">
                {window.opener ? '窗口即将关闭...' : '正在跳转到首页...'}
              </p>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm"
              >
                立即体验
              </button>
            </motion.div>
          )}

          {/* 错误后的操作 */}
          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-3"
            >
              <button
                onClick={() => router.push('/')}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm mr-3"
              >
                返回首页
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm"
              >
                重新登录
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
