# API设计文档

## 📋 概述

本文档详细描述了为爱而歌AI情歌创作平台的API接口设计，包括认证、用户管理、作品管理、AI服务等核心功能模块。

## 🔧 技术规范

### 基础信息
- **API版本**: v1
- **基础URL**: `https://api.loveaimusic.com/v1`
- **协议**: HTTPS
- **数据格式**: JSON
- **字符编码**: UTF-8

### 认证方式
- **JWT Token**: Bearer Token认证
- **API Key**: 用于服务间调用
- **OAuth2**: 第三方登录

### 响应格式
```json
{
  "success": true,
  "data": {},
  "message": "操作成功",
  "timestamp": "2024-10-03T12:00:00Z",
  "requestId": "req_123456789"
}
```

### 错误格式
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "参数验证失败",
    "details": {
      "field": "email",
      "reason": "邮箱格式不正确"
    }
  },
  "timestamp": "2024-10-03T12:00:00Z",
  "requestId": "req_123456789"
}
```

## 🔐 认证相关 API

### 用户注册
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "username": "username",
  "phone": "+8613800138000"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "username": "username",
      "isVerified": false
    },
    "token": "jwt_token_here"
  },
  "message": "注册成功，请验证邮箱"
}
```

### 用户登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### 邮箱验证
```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "token": "verification_token"
}
```

### 忘记密码
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### 重置密码
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token",
  "password": "new_password123"
}
```

### 刷新Token
```http
POST /api/auth/refresh
Authorization: Bearer <refresh_token>
```

### 第三方登录
```http
POST /api/auth/oauth/{provider}
Content-Type: application/json

{
  "code": "oauth_code",
  "state": "state_parameter"
}
```

## 👤 用户管理 API

### 获取用户信息
```http
GET /api/users/profile
Authorization: Bearer <token>
```

### 更新用户信息
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "new_username",
  "displayName": "显示名称",
  "bio": "个人简介",
  "avatar": "avatar_url"
}
```

### 上传头像
```http
POST /api/users/avatar
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image_file>
```

### 修改密码
```http
PUT /api/users/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "old_password",
  "newPassword": "new_password123"
}
```

### 删除账户
```http
DELETE /api/users/account
Authorization: Bearer <token>
Content-Type: application/json

{
  "password": "current_password"
}
```

## 🎵 音乐风格 API

### 获取音乐风格列表
```http
GET /api/music-styles
```

**响应**:
```json
{
  "success": true,
  "data": {
    "styles": [
      {
        "id": "style_1",
        "name": "深情抒情民谣",
        "englishName": "Deep Emotional Ballad",
        "description": "钢琴主导的温暖民谣，适合深情表白",
        "tags": ["抒情", "民谣", "温暖", "深情"],
        "mood": "温柔深情",
        "tempo": "慢板 (65-75 BPM)",
        "difficulty": "简单",
        "previewAudio": "https://example.com/preview.mp3",
        "vocalSuggestions": ["soft male", "gentle female"]
      }
    ]
  }
}
```

### 获取音乐风格详情
```http
GET /api/music-styles/{styleId}
```

## 🎼 作品管理 API

### 创建作品
```http
POST /api/works
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "我们的歌",
  "styleId": "style_1",
  "answers": {
    "round1": {
      "names": "小明和小红",
      "story": "我们的爱情故事...",
      "mood": "sweet",
      "keywords": ["爱情", "永恒"],
      "duration": 12
    },
    "round2": {
      "specialPlace": "咖啡厅",
      "features": ["poetic", "catchy"]
    }
  }
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "work": {
      "id": "work_123",
      "title": "我们的歌",
      "status": "generating",
      "createdAt": "2024-10-03T12:00:00Z"
    }
  }
}
```

### 获取作品列表
```http
GET /api/works
Authorization: Bearer <token>
Query Parameters:
- page: 页码 (默认: 1)
- limit: 每页数量 (默认: 10)
- status: 状态筛选 (pending, generating, completed, failed)
```

### 获取作品详情
```http
GET /api/works/{workId}
Authorization: Bearer <token>
```

### 更新作品
```http
PUT /api/works/{workId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "新的标题",
  "isPublic": true
}
```

### 删除作品
```http
DELETE /api/works/{workId}
Authorization: Bearer <token>
```

### 获取生成状态
```http
GET /api/works/{workId}/status
Authorization: Bearer <token>
```

**响应**:
```json
{
  "success": true,
  "data": {
    "status": "generating",
    "progress": 65,
    "stage": "music_generation",
    "estimatedTime": "2分钟"
  }
}
```

## 🤖 AI服务 API

### 生成歌词
```http
POST /api/ai/generate-lyrics
Authorization: Bearer <token>
Content-Type: application/json

{
  "userStory": "我们的爱情故事...",
  "mood": "sweet",
  "keywords": ["爱情", "永恒"],
  "style": "romantic",
  "features": ["poetic", "catchy"],
  "specialPlace": "咖啡厅"
}
```

### 生成音乐
```http
POST /api/ai/generate-music
Authorization: Bearer <token>
Content-Type: application/json

{
  "lyrics": "歌词内容...",
  "styleId": "style_1",
  "vocalType": "sweet female"
}
```

### 获取AI服务状态
```http
GET /api/ai/status
Authorization: Bearer <token>
```

## 📁 文件上传 API

### 上传文件
```http
POST /api/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <file>
type: image|audio|document
```

**响应**:
```json
{
  "success": true,
  "data": {
    "fileId": "file_123",
    "url": "https://cdn.loveaimusic.com/files/file_123.jpg",
    "size": 1024000,
    "type": "image/jpeg"
  }
}
```

### 获取上传进度
```http
GET /api/upload/{uploadId}/progress
Authorization: Bearer <token>
```

## 💳 支付相关 API

### 创建订单
```http
POST /api/payment/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "premium_monthly",
  "paymentMethod": "alipay|wechat"
}
```

### 支付回调
```http
POST /api/payment/callback/{provider}
Content-Type: application/json

{
  "orderId": "order_123",
  "status": "success|failed",
  "transactionId": "txn_123"
}
```

### 获取订单状态
```http
GET /api/payment/orders/{orderId}
Authorization: Bearer <token>
```

## 📊 统计相关 API

### 获取用户统计
```http
GET /api/stats/user
Authorization: Bearer <token>
```

### 获取作品统计
```http
GET /api/stats/works
Authorization: Bearer <token>
```

### 获取系统统计
```http
GET /api/stats/system
Authorization: Bearer <admin_token>
```

## 🔍 搜索相关 API

### 搜索作品
```http
GET /api/search/works
Query Parameters:
- q: 搜索关键词
- style: 音乐风格
- mood: 情绪
- page: 页码
- limit: 每页数量
```

### 搜索用户
```http
GET /api/search/users
Query Parameters:
- q: 搜索关键词
- page: 页码
- limit: 每页数量
```

## 🎯 互动相关 API

### 点赞作品
```http
POST /api/works/{workId}/like
Authorization: Bearer <token>
```

### 取消点赞
```http
DELETE /api/works/{workId}/like
Authorization: Bearer <token>
```

### 收藏作品
```http
POST /api/works/{workId}/favorite
Authorization: Bearer <token>
```

### 取消收藏
```http
DELETE /api/works/{workId}/favorite
Authorization: Bearer <token>
```

### 获取用户喜欢列表
```http
GET /api/users/likes
Authorization: Bearer <token>
```

### 获取用户收藏列表
```http
GET /api/users/favorites
Authorization: Bearer <token>
```

## 🔧 系统管理 API

### 获取系统配置
```http
GET /api/system/config
Authorization: Bearer <admin_token>
```

### 更新系统配置
```http
PUT /api/system/config
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "maintenanceMode": false,
  "maxWorksPerUser": 10
}
```

### 获取系统健康状态
```http
GET /api/system/health
```

## 📝 错误码说明

| 错误码 | HTTP状态码 | 说明 |
|--------|------------|------|
| VALIDATION_ERROR | 400 | 参数验证失败 |
| UNAUTHORIZED | 401 | 未授权访问 |
| FORBIDDEN | 403 | 禁止访问 |
| NOT_FOUND | 404 | 资源不存在 |
| CONFLICT | 409 | 资源冲突 |
| RATE_LIMIT_EXCEEDED | 429 | 请求频率超限 |
| INTERNAL_ERROR | 500 | 服务器内部错误 |
| SERVICE_UNAVAILABLE | 503 | 服务不可用 |

## 🔒 安全考虑

### 请求限制
- **频率限制**: 100次/分钟/用户
- **文件大小**: 最大10MB
- **请求超时**: 30秒

### 数据验证
- **输入验证**: 所有输入参数必须验证
- **SQL注入防护**: 使用参数化查询
- **XSS防护**: 输出转义
- **CSRF防护**: Token验证

### 访问控制
- **JWT过期时间**: 7天
- **刷新Token**: 30天
- **敏感操作**: 需要重新验证密码

## 📚 相关文档

- [BACKEND_DEVELOPMENT_PLAN.md](BACKEND_DEVELOPMENT_PLAN.md) - 后台开发计划
- [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) - 数据库设计文档
- [ENV_CONFIG.md](ENV_CONFIG.md) - 环境变量配置指南

---

**最后更新**: 2024年10月3日
**版本**: v1.0.0
**状态**: 设计阶段
