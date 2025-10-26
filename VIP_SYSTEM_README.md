# VIP试用码系统使用说明

## 🎫 系统概述

VIP试用码系统为"为爱而歌"AI情歌创作平台提供用户权限管理功能，支持三种用户类型：

- **未注册用户**: 只能查看，不能使用任何功能
- **临时VIP**: 可以创建1首歌，无积分系统
- **正式VIP**: 每月200积分，每次生成消耗20积分

## 🔧 技术架构

### 数据库表结构
- `users`: 用户信息表
- `vip_trial_codes`: VIP试用码表
- `credit_transactions`: 积分记录表
- `music_works`: 音乐作品表
- `user_form_data`: 用户表单数据表

### 核心服务
- `DatabaseService`: MySQL数据库连接服务
- `VipTrialService`: VIP试用码管理服务

## 🚀 快速开始

### 1. 环境配置

确保 `.env.local` 包含以下配置：

```env
# MySQL数据库配置
MYSQL_HOST=sh-cdb-5kh978ne.sql.tencentcdb.com
MYSQL_PORT=20500
MYSQL_USER=akashic
MYSQL_PASSWORD=Root123!@#
MYSQL_DATABASE=loveaimusic
MYSQL_SSL=true

# 管理员配置
ADMIN_SECRET_KEY=admin123456789

# 系统配置
VIP_TRIAL_CODE_LENGTH=8
VIP_TRIAL_CODE_EXPIRES_DAYS=90
```

### 2. 初始化数据库

```bash
# 连接MySQL数据库并执行初始化脚本
mysql -h sh-cdb-5kh978ne.sql.tencentcdb.com -P 20500 -u akashic -p loveaimusic < scripts/init-database.sql
```

### 3. 生成VIP试用码

#### 方法一：使用API（推荐）
```bash
curl -X POST http://localhost:3000/api/admin/vip-codes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer admin123456789" \
  -d '{"count": 10, "vipDays": 7}'
```

#### 方法二：使用测试脚本
```bash
node scripts/test-vip-codes.js
```

## 📋 API接口说明

### 管理员接口

#### 生成VIP试用码
```http
POST /api/admin/vip-codes
Authorization: Bearer {ADMIN_SECRET_KEY}
Content-Type: application/json

{
  "count": 10,      // 生成数量 (1-100)
  "vipDays": 7      // VIP天数 (1-365)
}
```

#### 查询VIP试用码
```http
GET /api/admin/vip-codes?status=active&limit=50
Authorization: Bearer {ADMIN_SECRET_KEY}
```

### 用户接口

#### 使用VIP试用码
```http
POST /api/user/vip-trial
Content-Type: application/json

{
  "code": "RCVJW1U6"  // 8位试用码
}
```

#### 查询VIP状态
```http
GET /api/user/vip-trial
```

## 🎯 使用流程

### 1. 管理员生成试用码
```bash
# 生成10个7天VIP试用码
curl -X POST http://localhost:3000/api/admin/vip-codes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer admin123456789" \
  -d '{"count": 10, "vipDays": 7}'
```

### 2. 用户使用试用码
```bash
# 用户输入试用码激活VIP
curl -X POST http://localhost:3000/api/user/vip-trial \
  -H "Content-Type: application/json" \
  -d '{"code": "RCVJW1U6"}'
```

### 3. 检查用户权限
```bash
# 查询用户VIP状态
curl http://localhost:3000/api/user/vip-trial
```

## 🔒 安全说明

1. **管理员密钥**: `ADMIN_SECRET_KEY` 必须保密，仅用于内部API调用
2. **试用码唯一性**: 系统自动确保生成的试用码不重复
3. **一次性使用**: 每个试用码只能使用一次
4. **有效期控制**: 试用码3个月后自动过期

## 📊 权限控制

### 用户权限检查
```typescript
// 检查用户是否可以创建音乐
const canCreate = await vipTrialService.canUserCreateMusic(userId);

if (!canCreate.canCreate) {
  return { error: canCreate.reason };
}
```

### 积分扣除
```typescript
// 正式VIP用户生成音乐时扣除积分
if (vipLevel === 'vip') {
  await database.update(
    'UPDATE users SET credits = credits - ? WHERE id = ?',
    [20, userId]
  );
}
```

## 🛠️ 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查MySQL连接配置
   - 确认网络连接和防火墙设置

2. **试用码生成失败**
   - 检查管理员密钥是否正确
   - 确认数据库表结构已初始化

3. **用户权限检查失败**
   - 检查用户ID是否正确
   - 确认VIP状态是否有效

### 日志查看
系统会在控制台输出详细的操作日志，包括：
- 试用码生成记录
- 用户使用记录
- 权限检查结果
- 错误信息

## 📈 性能优化

### 服务器配置建议
- **CPU**: 4核心（当前配置）
- **内存**: 4GB（当前配置）
- **数据库连接池**: 最大20个连接
- **缓存策略**: 建议使用Redis缓存热点数据

### 数据库优化
- 为常用查询字段添加索引
- 定期清理过期的试用码和会话数据
- 使用连接池管理数据库连接

## 🔄 系统维护

### 定期任务
1. **清理过期数据**: 删除过期的试用码和会话
2. **备份数据库**: 定期备份用户数据和作品信息
3. **监控系统**: 监控API调用频率和错误率

### 数据统计
```sql
-- 统计试用码使用情况
SELECT 
  status,
  COUNT(*) as count
FROM vip_trial_codes 
GROUP BY status;

-- 统计用户VIP分布
SELECT 
  vip_level,
  COUNT(*) as count
FROM users 
GROUP BY vip_level;
```

---

**注意**: 此系统仅用于内部管理，所有管理员接口都需要正确的认证密钥才能访问。
