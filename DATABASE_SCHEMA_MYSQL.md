# MySQL数据库设计文档

## 📋 概述

基于您提供的腾讯云MySQL数据库资源，我将原有的PostgreSQL设计调整为MySQL版本。

## 🗄️ 数据库信息

- **服务商**: 腾讯云CDB
- **地址**: `sh-cdb-5kh978ne.sql.tencentcdb.com`
- **端口**: `20500`
- **用户名**: `akashic`
- **数据库名**: `loveaimusic`

## 📊 MySQL表结构设计

### 1. 用户相关表

#### users (用户表)
```sql
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255),
    phone VARCHAR(20),
    avatar_url TEXT,
    display_name VARCHAR(100),
    bio TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified_at DATETIME NULL,
    phone_verified_at DATETIME NULL,
    last_login_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### user_sessions (用户会话表)
```sql
CREATE TABLE user_sessions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    refresh_token_hash VARCHAR(255),
    expires_at DATETIME NOT NULL,
    refresh_expires_at DATETIME,
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### user_profiles (用户资料表)
```sql
CREATE TABLE user_profiles (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    gender VARCHAR(10),
    birthday DATE,
    location VARCHAR(100),
    website VARCHAR(255),
    social_links JSON,
    preferences JSON,
    privacy_settings JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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
    tags JSON, -- 存储标签数组
    mood VARCHAR(50),
    tempo VARCHAR(50),
    difficulty VARCHAR(20),
    preview_audio_url TEXT,
    suno_prompt_template TEXT,
    vocal_suggestions JSON, -- 存储建议数组
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### user_works (用户作品表)
```sql
CREATE TABLE user_works (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    style_id VARCHAR(50),
    audio_url TEXT,
    audio_duration INT, -- 音频时长（秒）
    audio_size BIGINT, -- 音频文件大小（字节）
    lyrics JSON, -- 歌词结构
    generation_data JSON, -- 生成时的用户输入数据
    status VARCHAR(20) DEFAULT 'pending', -- pending, generating, completed, failed
    generation_progress INT DEFAULT 0, -- 生成进度（0-100）
    generation_stage VARCHAR(50), -- 当前生成阶段
    error_message TEXT, -- 错误信息
    is_public BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    play_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    favorite_count INT DEFAULT 0,
    share_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at DATETIME NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (style_id) REFERENCES music_styles(id)
);
```

#### user_answers (用户回答表)
```sql
CREATE TABLE user_answers (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    work_id VARCHAR(36) NOT NULL,
    round_number INT NOT NULL, -- 1 或 2
    question_id VARCHAR(100) NOT NULL,
    answer_value TEXT,
    answer_type VARCHAR(20) NOT NULL, -- text, textarea, select, radio, checkbox, chips, number
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (work_id) REFERENCES user_works(id) ON DELETE CASCADE
);
```

### 3. 互动相关表

#### user_likes (用户喜欢表)
```sql
CREATE TABLE user_likes (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    work_id VARCHAR(36) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (work_id) REFERENCES user_works(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_work_like (user_id, work_id)
);
```

#### user_favorites (用户收藏表)
```sql
CREATE TABLE user_favorites (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    work_id VARCHAR(36) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (work_id) REFERENCES user_works(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_work_favorite (user_id, work_id)
);
```

#### user_comments (用户评论表)
```sql
CREATE TABLE user_comments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    work_id VARCHAR(36) NOT NULL,
    parent_id VARCHAR(36) NULL,
    content TEXT NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    like_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (work_id) REFERENCES user_works(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES user_comments(id) ON DELETE CASCADE
);
```

### 4. 系统相关表

#### system_configs (系统配置表)
```sql
CREATE TABLE system_configs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value JSON,
    description TEXT,
    category VARCHAR(50),
    is_public BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### system_logs (系统日志表)
```sql
CREATE TABLE system_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    level VARCHAR(20) NOT NULL, -- debug, info, warn, error
    message TEXT NOT NULL,
    context JSON,
    user_id VARCHAR(36) NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

#### file_uploads (文件上传表)
```sql
CREATE TABLE file_uploads (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_url TEXT,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_type VARCHAR(20) NOT NULL, -- image, audio, document
    storage_type VARCHAR(20) NOT NULL, -- local, cos
    is_processed BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 5. 支付相关表

#### payment_orders (支付订单表)
```sql
CREATE TABLE payment_orders (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    order_no VARCHAR(50) UNIQUE NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'CNY',
    payment_method VARCHAR(20) NOT NULL, -- alipay, wechat, stripe
    status VARCHAR(20) DEFAULT 'pending', -- pending, paid, failed, cancelled, refunded
    transaction_id VARCHAR(100),
    payment_data JSON,
    expires_at DATETIME,
    paid_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### user_subscriptions (用户订阅表)
```sql
CREATE TABLE user_subscriptions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    plan_id VARCHAR(50) NOT NULL,
    plan_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- active, cancelled, expired
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    auto_renew BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
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

## 🔄 触发器

### 计数器触发器
```sql
-- 作品点赞计数器
DELIMITER //
CREATE TRIGGER update_work_like_count_insert
    AFTER INSERT ON user_likes
    FOR EACH ROW
BEGIN
    UPDATE user_works SET like_count = like_count + 1 WHERE id = NEW.work_id;
END//

CREATE TRIGGER update_work_like_count_delete
    AFTER DELETE ON user_likes
    FOR EACH ROW
BEGIN
    UPDATE user_works SET like_count = like_count - 1 WHERE id = OLD.work_id;
END//

-- 作品收藏计数器
CREATE TRIGGER update_work_favorite_count_insert
    AFTER INSERT ON user_favorites
    FOR EACH ROW
BEGIN
    UPDATE user_works SET favorite_count = favorite_count + 1 WHERE id = NEW.work_id;
END//

CREATE TRIGGER update_work_favorite_count_delete
    AFTER DELETE ON user_favorites
    FOR EACH ROW
BEGIN
    UPDATE user_works SET favorite_count = favorite_count - 1 WHERE id = OLD.work_id;
END//

DELIMITER ;
```

## 📊 初始化数据

### 插入音乐风格数据
```sql
INSERT INTO music_styles (id, name, english_name, description, tags, mood, tempo, difficulty, preview_audio_url, suno_prompt_template, vocal_suggestions) VALUES
('style_1', '深情抒情民谣', 'Deep Emotional Ballad', '钢琴主导的温暖民谣，适合深情表白', 
 JSON_ARRAY('抒情', '民谣', '温暖', '深情'), '温柔深情', '慢板 (65-75 BPM)', '简单', 
 'https://catname-1255475898.cos.ap-hongkong.myqcloud.com/nameSpace/webFile/aimusic/long/MP3/%E6%88%91%E7%9A%84%E4%B9%96%E4%B9%96%E9%BC%A0-%E6%B7%B1%E6%83%85%E6%B0%91%E8%B0%A3.mp3', 
 'Emotional Chinese ballad, slow tempo 65-75 BPM, acoustic guitar fingerpicking, soft piano accompaniment, gentle strings arrangement, [VOCAL_TYPE] tender vocals with raw emotion, intimate atmosphere, folk storytelling style, subtle harmonica touches, warm reverb, heartfelt lyrics about deep love and commitment, acoustic drums with brushes, melancholic yet hopeful melody, perfect for quiet romantic moments, traditional Chinese instruments like erhu subtly woven in background', 
 JSON_ARRAY('soft male', 'gentle female', 'male and female duet')),
('style_2', '甜蜜流行情歌', 'Sweet Pop Love Song', '欢快明亮的流行风格，适合年轻情侣', 
 JSON_ARRAY('流行', '甜蜜', '欢快', '年轻'), '欢快甜蜜', '中快板 (100-110 BPM)', '简单', 
 'https://catname-1255475898.cos.ap-hongkong.myqcloud.com/nameSpace/webFile/aimusic/long/MP3/%E6%88%91%E7%9A%84%E4%B9%96%E4%B9%96%E9%BC%A0-%E7%94%9C%E8%9C%9C%E6%B5%81%E8%A1%8C.mp3', 
 'Upbeat Chinese pop love song, bright tempo 100-110 BPM, catchy melody with memorable hooks, modern production with synthesizers, electric guitar riffs, bouncy bass lines, [VOCAL_TYPE] cheerful vocals with sweet harmonies, radio-friendly arrangement, uplifting and joyful mood, perfect for young couples, contemporary R&B influences, polished studio sound, celebration of new love and happiness, danceable rhythm, mainstream appeal with romantic lyrics', 
 JSON_ARRAY('sweet female', 'male', 'alternating male and female'));
```

### 插入系统配置
```sql
INSERT INTO system_configs (config_key, config_value, description, category, is_public) VALUES
('app_version', '"1.0.0"', '应用版本号', 'system', TRUE),
('maintenance_mode', 'false', '维护模式开关', 'system', TRUE),
('max_works_per_user', '10', '每个用户最大作品数量', 'user', FALSE),
('max_audio_file_size', '10485760', '音频文件最大大小(字节)', 'upload', FALSE),
('supported_audio_formats', '["mp3", "wav", "m4a"]', '支持的音频格式', 'upload', TRUE);
```

## 🔧 连接配置

### 环境变量配置
```env
# MySQL数据库配置
DATABASE_URL=mysql://akashic:Root123!@#@sh-cdb-5kh978ne.sql.tencentcdb.com:20500/loveaimusic
DATABASE_HOST=sh-cdb-5kh978ne.sql.tencentcdb.com
DATABASE_PORT=20500
DATABASE_NAME=loveaimusic
DATABASE_USER=akashic
DATABASE_PASSWORD=Root123!@#
```

### Prisma配置 (schema.prisma)
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id                String    @id @default(uuid()) @db.VarChar(36)
  email             String    @unique @db.VarChar(255)
  username          String?   @unique @db.VarChar(100)
  passwordHash      String?   @map("password_hash") @db.VarChar(255)
  phone             String?   @db.VarChar(20)
  avatarUrl         String?   @map("avatar_url") @db.Text
  displayName       String?   @map("display_name") @db.VarChar(100)
  bio               String?   @db.Text
  isVerified        Boolean   @default(false) @map("is_verified")
  isActive          Boolean   @default(true) @map("is_active")
  emailVerifiedAt   DateTime? @map("email_verified_at")
  phoneVerifiedAt   DateTime? @map("phone_verified_at")
  lastLoginAt       DateTime? @map("last_login_at")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  @@map("users")
}
```

## 📚 相关文档

- [ENV_ANALYSIS.md](ENV_ANALYSIS.md) - 环境配置分析
- [API_DESIGN.md](API_DESIGN.md) - API设计文档
- [BACKEND_DEVELOPMENT_PLAN.md](BACKEND_DEVELOPMENT_PLAN.md) - 后台开发计划

---

**最后更新**: 2024年10月3日
**版本**: v1.0.0
**状态**: MySQL适配版本
