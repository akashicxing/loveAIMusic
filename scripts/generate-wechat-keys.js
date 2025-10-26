#!/usr/bin/env node

/**
 * 微信安全认证密钥生成工具
 * 用于生成应用私钥、公钥和AES密钥
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 生成RSA密钥对
function generateRSAKeyPair() {
  log('\n🔑 生成RSA密钥对...', 'blue');
  
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });

  return { privateKey, publicKey };
}

// 生成AES密钥
function generateAESKey() {
  log('🔐 生成AES密钥...', 'blue');
  
  const aesKey = crypto.randomBytes(32).toString('base64');
  return aesKey;
}

// 保存密钥到文件
function saveKeyToFile(filename, content, description) {
  const filePath = path.join(process.cwd(), 'certs', filename);
  
  // 确保certs目录存在
  const certsDir = path.dirname(filePath);
  if (!fs.existsSync(certsDir)) {
    fs.mkdirSync(certsDir, { recursive: true });
  }
  
  fs.writeFileSync(filePath, content);
  log(`✅ ${description}已保存到: ${filePath}`, 'green');
  
  return filePath;
}

// 生成环境变量配置
function generateEnvConfig(keys) {
  const envConfig = `
# 微信安全认证配置
# 请将以下配置添加到您的 .env.local 或 .env.production 文件中

# 应用私钥路径
WECHAT_PRIVATE_KEY_PATH=./certs/wechat_private_key.pem

# 应用公钥路径
WECHAT_PUBLIC_KEY_PATH=./certs/wechat_public_key.pem

# 平台证书路径（需要从微信开放平台下载）
WECHAT_PLATFORM_CERT_PATH=./certs/wechat_platform_cert.pem

# AES加密密钥
WECHAT_AES_KEY=${keys.aesKey}

# 微信开放平台配置
WECHAT_APP_ID=your_wechat_app_id
WECHAT_APP_SECRET=your_wechat_app_secret
WECHAT_REDIRECT_URI=https://yourdomain.com/auth/wechat/callback
`;

  const envPath = path.join(process.cwd(), 'wechat-security-config.env');
  fs.writeFileSync(envPath, envConfig);
  log(`✅ 环境变量配置已生成: ${envPath}`, 'green');
  
  return envPath;
}

// 生成使用说明
function generateUsageGuide() {
  const guide = `
# 微信安全认证密钥使用说明

## 📋 生成的文件

1. **wechat_private_key.pem** - 应用私钥
   - 用于生成请求签名
   - 请妥善保管，不要泄露

2. **wechat_public_key.pem** - 应用公钥
   - 需要上传到微信开放平台
   - 用于微信验证您的签名

3. **wechat_platform_cert.pem** - 平台证书（需要手动下载）
   - 从微信开放平台下载
   - 用于验证微信回调的签名

4. **wechat-security-config.env** - 环境变量配置
   - 包含所有必要的配置项
   - 请复制到您的 .env 文件中

## 🔧 配置步骤

### 1. 上传公钥到微信开放平台
1. 登录微信开放平台
2. 进入"管理中心 - 网站应用 - 应用详情 - 开发配置 - API 安全"
3. 在"API非对称密钥"处上传 wechat_public_key.pem 的内容
4. 下载平台证书，保存为 wechat_platform_cert.pem

### 2. 配置环境变量
1. 复制 wechat-security-config.env 的内容
2. 添加到您的 .env.local 或 .env.production 文件
3. 填入真实的微信AppID和AppSecret

### 3. 测试安全认证
1. 启动应用
2. 访问 /test-wechat 页面
3. 检查安全认证状态

## ⚠️ 安全注意事项

1. **私钥安全**: 应用私钥必须妥善保管，不要提交到代码仓库
2. **证书更新**: 平台证书可能会更新，需要定期检查
3. **HTTPS要求**: 微信安全认证需要HTTPS环境
4. **域名配置**: 确保业务域名已在微信开放平台配置

## 🐛 故障排查

### 常见问题
1. **签名验证失败**: 检查公钥是否正确上传到微信开放平台
2. **证书验证失败**: 检查平台证书是否正确下载和配置
3. **加密失败**: 检查AES密钥是否正确配置
4. **网络错误**: 确保服务器可以访问微信API

### 调试方法
1. 查看服务器日志中的微信安全认证相关日志
2. 使用 /api/auth/wechat/verify 接口测试签名验证
3. 检查环境变量是否正确加载

## 📞 技术支持

如遇问题，请参考：
- 微信开放平台文档
- 项目中的 WECHAT_LOGIN_GUIDE.md
- 服务器日志和错误信息
`;

  const guidePath = path.join(process.cwd(), 'WECHAT_SECURITY_GUIDE.md');
  fs.writeFileSync(guidePath, guide);
  log(`✅ 使用说明已生成: ${guidePath}`, 'green');
  
  return guidePath;
}

// 主函数
function main() {
  log('🚀 微信安全认证密钥生成工具', 'bold');
  log('=' .repeat(50), 'blue');
  
  try {
    // 生成密钥
    const { privateKey, publicKey } = generateRSAKeyPair();
    const aesKey = generateAESKey();
    
    // 保存密钥文件
    const privateKeyPath = saveKeyToFile('wechat_private_key.pem', privateKey, '应用私钥');
    const publicKeyPath = saveKeyToFile('wechat_public_key.pem', publicKey, '应用公钥');
    
    // 生成环境变量配置
    const envPath = generateEnvConfig({ aesKey });
    
    // 生成使用说明
    const guidePath = generateUsageGuide();
    
    log('\n' + '=' .repeat(50), 'blue');
    log('🎉 密钥生成完成！', 'green');
    
    log('\n📋 下一步操作:', 'yellow');
    log('1. 上传公钥到微信开放平台', 'blue');
    log('2. 下载平台证书', 'blue');
    log('3. 配置环境变量', 'blue');
    log('4. 测试安全认证功能', 'blue');
    
    log('\n📚 详细说明请查看: WECHAT_SECURITY_GUIDE.md', 'blue');
    
  } catch (error) {
    log('❌ 密钥生成失败:', 'red');
    log(error.message, 'red');
    process.exit(1);
  }
}

// 运行生成工具
main();
