# 数据库设计文档

## 📋 概述

本文档详细描述了为爱而歌AI情歌创作平台的数据库设计，包括表结构、关系设计、索引策略等。

## 🗄️ 数据库选择

- **主数据库**: PostgreSQL 15+
- **缓存数据库**: Redis 7+
- **原因**: 
  - PostgreSQL支持JSONB类型，适合存储复杂的歌词和配置数据
  - 支持全文搜索和数组操作
  - 事务支持完善
  - Redis提供高性能缓存和会话存储

## 📊 表结构设计

### 1. 用户相关表

#### users (用户表)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255),
    phone VARCHAR(20),
    avatar_url TEXT,
    display_name VARCHAR(100),
    bio TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    phone_verified_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**字段说明**:
- `id`: 用户唯一标识
- `email`: 邮箱地址（唯一）
- `username`: 用户名（唯一）
- `password_hash`: 密码哈希值
- `phone`: 手机号码
- `avatar_url`: 头像URL
- `display_name`: 显示名称
- `bio`: 个人简介
- `is_verified`: 是否已验证
- `is_active`: 是否激活
- `email_verified_at`: 邮箱验证时间
- `phone_verified_at`: 手机验证时间
- `last_login_at`: 最后登录时间

#### user_sessions (用户会话表)
```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    refresh_token_hash VARCHAR(255),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    refresh_expires_at TIMESTAMP WITH TIME ZONE,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### user_profiles (用户资料表)
```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    gender VARCHAR(10),
    birthday DATE,
    location VARCHAR(100),
    website VARCHAR(255),
    social_links JSONB,
    preferences JSONB,
    privacy_settings JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. 音乐相关表

#### music_styles (音乐风格表)
```sql
CREATE TABLE music_styles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    english_name VARCHAR(100),
    description TEXT,
    tags TEXT[],
    mood VARCHAR(50),
    tempo VARCHAR(50),
    difficulty VARCHAR(20),
    preview_audio_url TEXT,
    suno_prompt_template TEXT,
    vocal_suggestions TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### user_works (用户作品表)
```sql
CREATE TABLE user_works (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    style_id VARCHAR(50) REFERENCES music_styles(id),
    audio_url TEXT,
    audio_duration INTEGER, -- 音频时长（秒）
    audio_size BIGINT, -- 音频文件大小（字节）
    lyrics JSONB, -- 歌词结构
    generation_data JSONB, -- 生成时的用户输入数据
    status VARCHAR(20) DEFAULT 'pending', -- pending, generating, completed, failed
    generation_progress INTEGER DEFAULT 0, -- 生成进度（0-100）
    generation_stage VARCHAR(50), -- 当前生成阶段
    error_message TEXT, -- 错误信息
    is_public BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    play_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    favorite_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);
```

#### user_answers (用户回答表)
```sql
CREATE TABLE user_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    work_id UUID REFERENCES user_works(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL, -- 1 或 2
    question_id VARCHAR(100) NOT NULL,
    answer_value TEXT,
    answer_type VARCHAR(20) NOT NULL, -- text, textarea, select, radio, checkbox, chips, number
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. 互动相关表

#### user_likes (用户喜欢表)
```sql
CREATE TABLE user_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    work_id UUID REFERENCES user_works(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, work_id)
);
```

#### user_favorites (用户收藏表)
```sql
CREATE TABLE user_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    work_id UUID REFERENCES user_works(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, work_id)
);
```

#### user_comments (用户评论表)
```sql
CREATE TABLE user_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    work_id UUID REFERENCES user_works(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES user_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. 系统相关表

#### system_configs (系统配置表)
```sql
CREATE TABLE system_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB,
    description TEXT,
    category VARCHAR(50),
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### system_logs (系统日志表)
```sql
CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level VARCHAR(20) NOT NULL, -- debug, info, warn, error
    message TEXT NOT NULL,
    context JSONB,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### file_uploads (文件上传表)
```sql
CREATE TABLE file_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    original_name VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_url TEXT,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_type VARCHAR(20) NOT NULL, -- image, audio, document
    storage_type VARCHAR(20) NOT NULL, -- local, s3, cos
    is_processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5. 支付相关表

#### payment_orders (支付订单表)
```sql
CREATE TABLE payment_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    order_no VARCHAR(50) UNIQUE NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'CNY',
    payment_method VARCHAR(20) NOT NULL, -- alipay, wechat, stripe
    status VARCHAR(20) DEFAULT 'pending', -- pending, paid, failed, cancelled, refunded
    transaction_id VARCHAR(100),
    payment_data JSONB,
    expires_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### user_subscriptions (用户订阅表)
```sql
CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_id VARCHAR(50) NOT NULL,
    plan_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- active, cancelled, expired
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    auto_renew BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔗 表关系图

```
users (1) ←→ (N) user_sessions
users (1) ←→ (1) user_profiles
users (1) ←→ (N) user_works
users (1) ←→ (N) user_answers
users (1) ←→ (N) user_likes
users (1) ←→ (N) user_favorites
users (1) ←→ (N) user_comments
users (1) ←→ (N) file_uploads
users (1) ←→ (N) payment_orders
users (1) ←→ (N) user_subscriptions

music_styles (1) ←→ (N) user_works
user_works (1) ←→ (N) user_answers
user_works (1) ←→ (N) user_likes
user_works (1) ←→ (N) user_favorites
user_works (1) ←→ (N) user_comments

user_comments (1) ←→ (N) user_comments (自关联)
```

## 📈 索引策略

### 主键索引
- 所有表的主键自动创建唯一索引

### 唯一索引
```sql
-- 用户表
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE UNIQUE INDEX idx_users_username ON users(username);

-- 会话表
CREATE UNIQUE INDEX idx_user_sessions_token ON user_sessions(token_hash);

-- 订单表
CREATE UNIQUE INDEX idx_payment_orders_order_no ON payment_orders(order_no);
```

### 普通索引
```sql
-- 用户相关
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);

-- 作品相关
CREATE INDEX idx_user_works_user_id ON user_works(user_id);
CREATE INDEX idx_user_works_style_id ON user_works(style_id);
CREATE INDEX idx_user_works_status ON user_works(status);
CREATE INDEX idx_user_works_created_at ON user_works(created_at);
CREATE INDEX idx_user_works_is_public ON user_works(is_public);
CREATE INDEX idx_user_works_play_count ON user_works(play_count);

-- 互动相关
CREATE INDEX idx_user_likes_user_id ON user_likes(user_id);
CREATE INDEX idx_user_likes_work_id ON user_likes(work_id);
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_work_id ON user_favorites(work_id);
CREATE INDEX idx_user_comments_work_id ON user_comments(work_id);
CREATE INDEX idx_user_comments_user_id ON user_comments(user_id);

-- 回答相关
CREATE INDEX idx_user_answers_user_id ON user_answers(user_id);
CREATE INDEX idx_user_answers_work_id ON user_answers(work_id);
CREATE INDEX idx_user_answers_round_number ON user_answers(round_number);

-- 系统相关
CREATE INDEX idx_system_logs_level ON system_logs(level);
CREATE INDEX idx_system_logs_created_at ON system_logs(created_at);
CREATE INDEX idx_system_logs_user_id ON system_logs(user_id);

-- 文件相关
CREATE INDEX idx_file_uploads_user_id ON file_uploads(user_id);
CREATE INDEX idx_file_uploads_file_type ON file_uploads(file_type);
CREATE INDEX idx_file_uploads_created_at ON file_uploads(created_at);

-- 支付相关
CREATE INDEX idx_payment_orders_user_id ON payment_orders(user_id);
CREATE INDEX idx_payment_orders_status ON payment_orders(status);
CREATE INDEX idx_payment_orders_created_at ON payment_orders(created_at);
```

### 复合索引
```sql
-- 用户作品复合索引
CREATE INDEX idx_user_works_user_status ON user_works(user_id, status);
CREATE INDEX idx_user_works_public_created ON user_works(is_public, created_at);

-- 用户互动复合索引
CREATE INDEX idx_user_likes_user_created ON user_likes(user_id, created_at);
CREATE INDEX idx_user_favorites_user_created ON user_favorites(user_id, created_at);

-- 系统日志复合索引
CREATE INDEX idx_system_logs_level_created ON system_logs(level, created_at);
```

### 全文搜索索引
```sql
-- 作品标题和歌词全文搜索
CREATE INDEX idx_user_works_title_fts ON user_works USING gin(to_tsvector('chinese', title));
CREATE INDEX idx_user_works_lyrics_fts ON user_works USING gin(to_tsvector('chinese', lyrics::text));

-- 用户简介全文搜索
CREATE INDEX idx_users_bio_fts ON users USING gin(to_tsvector('chinese', bio));
```

## 🔄 触发器

### 更新时间触发器
```sql
-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表创建更新时间触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_music_styles_updated_at BEFORE UPDATE ON music_styles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_works_updated_at BEFORE UPDATE ON user_works
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_comments_updated_at BEFORE UPDATE ON user_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_configs_updated_at BEFORE UPDATE ON system_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_orders_updated_at BEFORE UPDATE ON payment_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 计数器触发器
```sql
-- 作品点赞计数器
CREATE OR REPLACE FUNCTION update_work_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE user_works SET like_count = like_count + 1 WHERE id = NEW.work_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE user_works SET like_count = like_count - 1 WHERE id = OLD.work_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_work_like_count_trigger
    AFTER INSERT OR DELETE ON user_likes
    FOR EACH ROW EXECUTE FUNCTION update_work_like_count();

-- 作品收藏计数器
CREATE OR REPLACE FUNCTION update_work_favorite_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE user_works SET favorite_count = favorite_count + 1 WHERE id = NEW.work_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE user_works SET favorite_count = favorite_count - 1 WHERE id = OLD.work_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_work_favorite_count_trigger
    AFTER INSERT OR DELETE ON user_favorites
    FOR EACH ROW EXECUTE FUNCTION update_work_favorite_count();
```

## 🔒 数据安全

### 行级安全策略
```sql
-- 启用行级安全
ALTER TABLE user_works ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_comments ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己的数据
CREATE POLICY user_works_policy ON user_works
    FOR ALL TO authenticated
    USING (user_id = current_user_id());

CREATE POLICY user_answers_policy ON user_answers
    FOR ALL TO authenticated
    USING (user_id = current_user_id());
```

### 数据加密
```sql
-- 敏感数据加密函数
CREATE OR REPLACE FUNCTION encrypt_sensitive_data(data TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN encode(encrypt(data::bytea, current_setting('app.encryption_key'), 'aes'), 'base64');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrypt_sensitive_data(encrypted_data TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN convert_from(decrypt(decode(encrypted_data, 'base64'), current_setting('app.encryption_key'), 'aes'), 'UTF8');
END;
$$ LANGUAGE plpgsql;
```

## 📊 数据备份策略

### 备份计划
- **全量备份**: 每日凌晨2点
- **增量备份**: 每小时
- **日志备份**: 实时
- **保留策略**: 全量备份保留30天，增量备份保留7天

### 备份脚本
```bash
#!/bin/bash
# 数据库备份脚本

# 全量备份
pg_dump -h localhost -U postgres -d loveaimusic > backup_$(date +%Y%m%d_%H%M%S).sql

# 增量备份
pg_basebackup -h localhost -U postgres -D /backup/incremental/$(date +%Y%m%d_%H%M%S)
```

## 🔧 性能优化

### 查询优化
- 使用EXPLAIN ANALYZE分析查询性能
- 避免SELECT *，只查询需要的字段
- 使用LIMIT限制结果集大小
- 合理使用JOIN和子查询

### 连接池配置
```sql
-- PostgreSQL连接池配置
max_connections = 200
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB
```

### 分区策略
```sql
-- 按时间分区系统日志表
CREATE TABLE system_logs_2024_10 PARTITION OF system_logs
    FOR VALUES FROM ('2024-10-01') TO ('2024-11-01');

CREATE TABLE system_logs_2024_11 PARTITION OF system_logs
    FOR VALUES FROM ('2024-11-01') TO ('2024-12-01');
```

## 📚 相关文档

- [BACKEND_DEVELOPMENT_PLAN.md](BACKEND_DEVELOPMENT_PLAN.md) - 后台开发计划
- [API_DESIGN.md](API_DESIGN.md) - API设计文档
- [ENV_CONFIG.md](ENV_CONFIG.md) - 环境变量配置指南

---

**最后更新**: 2024年10月3日
**版本**: v1.0.0
**状态**: 设计阶段
