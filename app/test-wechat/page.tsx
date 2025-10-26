/**
 * 微信登录测试页面
 * 用于测试和验证微信登录功能
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import RomanticBackground from '@/components/RomanticBackground';
import WeChatLogin from '@/components/WeChatLogin';
import Logo from '@/components/Logo';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

export default function TestWeChatPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([
    { name: '环境变量配置', status: 'pending', message: '检查微信登录配置...' },
    { name: '微信API连接', status: 'pending', message: '测试微信API连接...' },
    { name: '数据库连接', status: 'pending', message: '测试数据库连接...' },
    { name: 'PC OpenSDK加载', status: 'pending', message: '测试PC OpenSDK...' },
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);

  // 运行所有测试
  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults(prev => prev.map(test => ({ ...test, status: 'pending', message: '测试中...' })));

    // 测试1: 环境变量配置
    await testEnvironmentConfig();
    await new Promise(resolve => setTimeout(resolve, 500));

    // 测试2: 微信API连接
    await testWeChatAPI();
    await new Promise(resolve => setTimeout(resolve, 500));

    // 测试3: 数据库连接
    await testDatabaseConnection();
    await new Promise(resolve => setTimeout(resolve, 500));

    // 测试4: PC OpenSDK加载
    await testPCOpenSDK();
    await new Promise(resolve => setTimeout(resolve, 500));

    setIsRunning(false);
  };

  // 测试环境变量配置
  const testEnvironmentConfig = async () => {
    try {
      const response = await fetch('/api/auth/wechat');
      const result = await response.json();
      
      if (result.success && result.data.isConfigured) {
        updateTestResult(0, 'success', '环境变量配置正确', result.data);
      } else {
        updateTestResult(0, 'error', '环境变量配置不完整', result);
      }
    } catch (error) {
      updateTestResult(0, 'error', '无法获取配置信息', error);
    }
  };

  // 测试微信API连接
  const testWeChatAPI = async () => {
    try {
      // 这里可以添加一个测试API接口
      const response = await fetch('/api/auth/wechat');
      const result = await response.json();
      
      if (result.success) {
        updateTestResult(1, 'success', '微信API连接正常');
      } else {
        updateTestResult(1, 'error', '微信API连接失败', result);
      }
    } catch (error) {
      updateTestResult(1, 'error', '网络连接失败', error);
    }
  };

  // 测试数据库连接
  const testDatabaseConnection = async () => {
    try {
      // 这里可以添加一个数据库测试接口
      const response = await fetch('/api/test/database');
      const result = await response.json();
      
      if (result.success) {
        updateTestResult(2, 'success', '数据库连接正常');
      } else {
        updateTestResult(2, 'error', '数据库连接失败', result);
      }
    } catch (error) {
      updateTestResult(2, 'error', '数据库测试接口不存在', error);
    }
  };

  // 测试PC OpenSDK加载
  const testPCOpenSDK = async () => {
    try {
      // 检查PC OpenSDK是否加载
      if (typeof window !== 'undefined' && window.wxopensdk) {
        updateTestResult(3, 'success', 'PC OpenSDK加载成功');
      } else {
        updateTestResult(3, 'error', 'PC OpenSDK未加载');
      }
    } catch (error) {
      updateTestResult(3, 'error', 'PC OpenSDK测试失败', error);
    }
  };

  // 更新测试结果
  const updateTestResult = (index: number, status: 'success' | 'error', message: string, details?: any) => {
    setTestResults(prev => prev.map((test, i) => 
      i === index ? { ...test, status, message, details } : test
    ));
  };

  // 微信登录成功回调
  const handleWeChatLoginSuccess = (user: any) => {
    setUserInfo(user);
    console.log('微信登录成功:', user);
  };

  // 微信登录错误回调
  const handleWeChatLoginError = (error: string) => {
    console.error('微信登录失败:', error);
  };

  // 获取状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />;
    }
  };

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-300';
      case 'error':
        return 'text-red-300';
      default:
        return 'text-yellow-300';
    }
  };

  return (
    <div className="min-h-screen relative">
      <RomanticBackground />
      
      <div className="relative z-10 min-h-screen px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 页面标题 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <Logo size="lg" showText={true} />
            <h1 className="text-3xl font-bold text-white mt-4 mb-2">微信登录测试</h1>
            <p className="text-pink-200">测试和验证微信登录功能是否正常工作</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 测试结果 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                测试结果
              </h2>

              <div className="space-y-3">
                {testResults.map((test, index) => (
                  <motion.div
                    key={test.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(test.status)}
                      <span className="text-white font-medium">{test.name}</span>
                    </div>
                    <span className={`text-sm ${getStatusColor(test.status)}`}>
                      {test.message}
                    </span>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6">
                <button
                  onClick={runAllTests}
                  disabled={isRunning}
                  className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-medium hover:from-pink-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isRunning ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-5 h-5" />
                  )}
                  {isRunning ? '测试中...' : '运行所有测试'}
                </button>
              </div>
            </motion.div>

            {/* 微信登录测试 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5" />
                微信登录测试
              </h2>

              <div className="space-y-4">
                <p className="text-pink-200 text-sm">
                  点击下方按钮测试微信登录功能。请确保已配置正确的微信AppID和AppSecret。
                </p>

                <WeChatLogin
                  onLoginSuccess={handleWeChatLoginSuccess}
                  onLoginError={handleWeChatLoginError}
                  size="lg"
                  variant="default"
                  showText={true}
                />

                {userInfo && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg"
                  >
                    <h3 className="text-green-200 font-medium mb-2">登录成功！</h3>
                    <div className="text-sm text-green-300 space-y-1">
                      <p>用户ID: {userInfo.id}</p>
                      <p>昵称: {userInfo.nickname}</p>
                      <p>VIP等级: {userInfo.vipLevel}</p>
                      <p>积分: {userInfo.credits}</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>

          {/* 配置说明 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
          >
            <h2 className="text-xl font-bold text-white mb-4">配置说明</h2>
            <div className="text-pink-200 text-sm space-y-2">
              <p>1. 确保在环境变量中配置了正确的微信AppID和AppSecret</p>
              <p>2. 在微信开放平台中配置了正确的授权回调域名</p>
              <p>3. 数据库已正确初始化并包含微信相关表结构</p>
              <p>4. 服务器支持HTTPS（微信登录需要HTTPS环境）</p>
            </div>
          </motion.div>

          {/* 返回按钮 */}
          <div className="text-center mt-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.history.back()}
              className="px-6 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
            >
              返回上一页
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
