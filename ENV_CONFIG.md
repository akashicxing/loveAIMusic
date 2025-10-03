# 环境变量配置指南

## 📋 概述

本项目需要配置环境变量来支持不同环境的部署。请根据您的部署环境创建相应的环境变量文件。

## 🔧 环境变量文件

### 开发环境
创建 `.env.local` 文件用于本地开发：

```bash
# 复制模板文件
cp ENV_TEMPLATE.txt .env.local
```

### 生产环境
创建 `.env.production` 文件用于生产部署：

```bash
# 复制模板文件
cp ENV_TEMPLATE.txt .env.production
```

## 📝 环境变量列表

### 基础配置
```env
# 环境标识
NODE_ENV=development|production
NEXT_PUBLIC_APP_ENV=development|production

# 应用基础配置
NEXT_PUBLIC_APP_NAME=为爱而歌
NEXT_PUBLIC_APP_NAME_EN=StarWhisper
NEXT_PUBLIC_APP_DESCRIPTION=AI情歌创作平台
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 数据库配置
```env
# PostgreSQL数据库
DATABASE_URL=postgresql://username:password@localhost:5432/loveaimusic_dev
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=loveaimusic_dev
DATABASE_USER=username
DATABASE_PASSWORD=password
```

### Redis配置
```env
# Redis缓存
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### AI服务配置
```env
# Suno AI配置
SUNO_API_KEY=your_suno_api_key_here
SUNO_API_URL=https://api.suno.ai
SUNO_WEBHOOK_SECRET=your_webhook_secret_here

# OpenAI配置 (用于歌词生成)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_API_URL=https://api.openai.com/v1
```

### 文件存储配置
```env
# 本地存储
FILE_STORAGE_TYPE=local
FILE_STORAGE_PATH=./uploads
NEXT_PUBLIC_FILE_BASE_URL=http://localhost:3000/uploads

# 云存储配置 (生产环境推荐)
# AWS S3配置
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=loveaimusic-prod

# 腾讯云COS配置
TENCENT_SECRET_ID=your_tencent_secret_id
TENCENT_SECRET_KEY=your_tencent_secret_key
TENCENT_COS_REGION=ap-beijing
TENCENT_COS_BUCKET=loveaimusic-prod
```

### 用户认证配置
```env
# JWT配置
JWT_SECRET=your_jwt_secret_key_for_development
JWT_EXPIRES_IN=7d

# OAuth配置
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# 微信登录配置
WECHAT_APP_ID=your_wechat_app_id
WECHAT_APP_SECRET=your_wechat_app_secret
```

### 邮件服务配置
```env
# SMTP配置
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_email_password
SMTP_FROM=noreply@loveaimusic.com
```

### 短信服务配置
```env
# 阿里云短信
ALIYUN_ACCESS_KEY_ID=your_aliyun_access_key
ALIYUN_ACCESS_KEY_SECRET=your_aliyun_secret_key
ALIYUN_SMS_SIGN_NAME=为爱而歌
ALIYUN_SMS_TEMPLATE_CODE=SMS_123456789
```

### 支付配置
```env
# 支付宝配置
ALIPAY_APP_ID=your_alipay_app_id
ALIPAY_PRIVATE_KEY=your_alipay_private_key
ALIPAY_PUBLIC_KEY=your_alipay_public_key

# 微信支付配置
WECHAT_PAY_MCH_ID=your_wechat_pay_mch_id
WECHAT_PAY_API_KEY=your_wechat_pay_api_key
WECHAT_PAY_CERT_PATH=./certs/wechat_pay_cert.pem
```

### 监控和日志配置
```env
# Sentry错误监控
SENTRY_DSN=your_sentry_dsn_for_development

# 日志级别
LOG_LEVEL=debug|info|warn|error
```

### 安全配置
```env
# CORS配置
CORS_ORIGIN=http://localhost:3000,http://127.0.0.1:3000

# 加密密钥
ENCRYPTION_KEY=your_encryption_key_for_development

# API限流配置
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 第三方服务配置
```env
# 百度翻译API (用于歌词翻译)
BAIDU_TRANSLATE_APP_ID=your_baidu_translate_app_id
BAIDU_TRANSLATE_SECRET_KEY=your_baidu_translate_secret_key

# 网易云音乐API (用于音乐信息获取)
NETEASE_MUSIC_API_URL=https://api.music.163.com
```

## 🚀 部署环境配置

### 开发环境 (.env.local)
```env
NODE_ENV=development
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
DEBUG=true
NEXT_PUBLIC_DEBUG=true
LOG_LEVEL=debug
SKIP_EMAIL_VERIFICATION=true
SKIP_PHONE_VERIFICATION=true
ENABLE_TEST_DATA=true
```

### 生产环境 (.env.production)
```env
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
DEBUG=false
NEXT_PUBLIC_DEBUG=false
LOG_LEVEL=info
SKIP_EMAIL_VERIFICATION=false
SKIP_PHONE_VERIFICATION=false
ENABLE_TEST_DATA=false
```

## 🔒 安全注意事项

1. **永远不要将 `.env.local` 或 `.env.production` 文件提交到Git**
2. **生产环境的密钥必须使用强密码**
3. **定期轮换API密钥和JWT密钥**
4. **使用环境变量管理服务（如Vercel、Netlify等）来管理生产环境变量**

## 📦 部署平台配置

### Vercel部署
在Vercel控制台中设置环境变量：
- 进入项目设置 → Environment Variables
- 添加所有必需的环境变量

### Netlify部署
在Netlify控制台中设置环境变量：
- 进入Site settings → Environment variables
- 添加所有必需的环境变量

### 自托管部署
在服务器上创建 `.env.production` 文件：
```bash
# 在服务器上创建环境变量文件
nano .env.production
# 添加所有必需的环境变量
```

## 🛠️ 快速开始

1. 复制环境变量模板：
```bash
cp ENV_TEMPLATE.txt .env.local
```

2. 编辑 `.env.local` 文件，填入您的实际配置值

3. 重启开发服务器：
```bash
npm run dev
```

## 📚 相关文档

- [Next.js环境变量文档](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel环境变量配置](https://vercel.com/docs/concepts/projects/environment-variables)
- [Netlify环境变量配置](https://docs.netlify.com/environment-variables/overview/)
