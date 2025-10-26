#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 微信登录本地测试配置工具');
console.log('==================================================\n');

// 检查是否存在 .env.local
const envPath = path.join(process.cwd(), '.env.local');
const templatePath = path.join(process.cwd(), 'wechat-local-test.env');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(templatePath)) {
    console.log('📋 复制配置模板...');
    fs.copyFileSync(templatePath, envPath);
    console.log('✅ 配置模板已复制到 .env.local');
  } else {
    console.log('❌ 配置模板文件不存在: wechat-local-test.env');
    process.exit(1);
  }
} else {
  console.log('✅ .env.local 文件已存在');
}

console.log('\n📝 请按照以下步骤完成配置：');
console.log('1. 登录微信开放平台: https://open.weixin.qq.com/');
console.log('2. 绑定管理员（参考官方文档）');
console.log('3. 添加授权回调域名: localhost:3000');
console.log('4. 获取 AppID 和 AppSecret');
console.log('5. 更新 .env.local 文件中的配置');
console.log('6. 重启开发服务器: npm run dev');

console.log('\n🔍 检查当前配置状态...');
try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const checks = [
    { key: 'WECHAT_APP_ID', pattern: /WECHAT_APP_ID=wx/ },
    { key: 'WECHAT_APP_SECRET', pattern: /WECHAT_APP_SECRET=(?!your_wechat_app_secret_here)/ },
    { key: 'WECHAT_REDIRECT_URI', pattern: /WECHAT_REDIRECT_URI=http:\/\/localhost:3000/ },
    { key: 'JWT_SECRET', pattern: /JWT_SECRET=(?!your_jwt_secret_key_here)/ }
  ];

  checks.forEach(check => {
    if (check.pattern.test(envContent)) {
      console.log(`✅ ${check.key}: 已配置`);
    } else {
      console.log(`❌ ${check.key}: 需要配置`);
    }
  });

  console.log('\n🎉 配置检查完成！');
  console.log('如果所有项目都显示 ✅，则可以开始测试微信登录功能。');

} catch (error) {
  console.log('❌ 读取配置文件失败:', error.message);
}

console.log('\n📚 更多信息请查看: WECHAT_LOCAL_TEST_GUIDE.md');
