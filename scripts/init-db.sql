-- 为爱而歌 AI情歌创作平台 - 数据库初始化脚本

-- 创建扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 用户表
CREATE TABLE IF NOT EXISTS users (
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户会话表
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 音乐风格表
CREATE TABLE IF NOT EXISTS music_styles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    english_name VARCHAR(100),
    description TEXT,
    tags TEXT[], -- 标签数组
    mood VARCHAR(50),
    tempo VARCHAR(50),
    difficulty VARCHAR(20),
    preview_audio_url TEXT,
    suno_prompt_template TEXT,
    vocal_suggestions TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户作品表
CREATE TABLE IF NOT EXISTS user_works (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    style_id VARCHAR(50) REFERENCES music_styles(id),
    audio_url TEXT,
    lyrics JSONB, -- 歌词结构
    generation_data JSONB, -- 生成时的用户输入数据
    status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
    is_public BOOLEAN DEFAULT FALSE,
    play_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户回答表 (存储用户创作时的回答)
CREATE TABLE IF NOT EXISTS user_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    work_id UUID REFERENCES user_works(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL, -- 1 或 2
    question_id VARCHAR(100) NOT NULL,
    answer_value TEXT,
    answer_type VARCHAR(20) NOT NULL, -- text, textarea, select, radio, checkbox, chips, number
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户喜欢表
CREATE TABLE IF NOT EXISTS user_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    work_id UUID REFERENCES user_works(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, work_id)
);

-- 用户收藏表
CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    work_id UUID REFERENCES user_works(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, work_id)
);

-- 系统配置表
CREATE TABLE IF NOT EXISTS system_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_works_user_id ON user_works(user_id);
CREATE INDEX IF NOT EXISTS idx_user_works_style_id ON user_works(style_id);
CREATE INDEX IF NOT EXISTS idx_user_works_status ON user_works(status);
CREATE INDEX IF NOT EXISTS idx_user_works_created_at ON user_works(created_at);
CREATE INDEX IF NOT EXISTS idx_user_answers_user_id ON user_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_work_id ON user_answers(work_id);
CREATE INDEX IF NOT EXISTS idx_user_likes_user_id ON user_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_likes_work_id ON user_likes(work_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_work_id ON user_favorites(work_id);

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

CREATE TRIGGER update_music_styles_updated_at BEFORE UPDATE ON music_styles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_works_updated_at BEFORE UPDATE ON user_works
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_configs_updated_at BEFORE UPDATE ON system_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入默认音乐风格数据
INSERT INTO music_styles (id, name, english_name, description, tags, mood, tempo, difficulty, preview_audio_url, suno_prompt_template, vocal_suggestions) VALUES
('style_1', '深情抒情民谣', 'Deep Emotional Ballad', '钢琴主导的温暖民谣，适合深情表白', ARRAY['抒情', '民谣', '温暖', '深情'], '温柔深情', '慢板 (65-75 BPM)', '简单', 'https://catname-1255475898.cos.ap-hongkong.myqcloud.com/nameSpace/webFile/aimusic/long/MP3/%E6%88%91%E7%9A%84%E4%B9%96%E4%B9%96%E9%BC%A0-%E6%B7%B1%E6%83%85%E6%B0%91%E8%B0%A3.mp3', 'Emotional Chinese ballad, slow tempo 65-75 BPM, acoustic guitar fingerpicking, soft piano accompaniment, gentle strings arrangement, [VOCAL_TYPE] tender vocals with raw emotion, intimate atmosphere, folk storytelling style, subtle harmonica touches, warm reverb, heartfelt lyrics about deep love and commitment, acoustic drums with brushes, melancholic yet hopeful melody, perfect for quiet romantic moments, traditional Chinese instruments like erhu subtly woven in background', ARRAY['soft male', 'gentle female', 'male and female duet']),
('style_2', '甜蜜流行情歌', 'Sweet Pop Love Song', '欢快明亮的流行风格，适合年轻情侣', ARRAY['流行', '甜蜜', '欢快', '年轻'], '欢快甜蜜', '中快板 (100-110 BPM)', '简单', 'https://catname-1255475898.cos.ap-hongkong.myqcloud.com/nameSpace/webFile/aimusic/long/MP3/%E6%88%91%E7%9A%84%E4%B9%96%E4%B9%96%E9%BC%A0-%E7%94%9C%E8%9C%9C%E6%B5%81%E8%A1%8C.mp3', 'Upbeat Chinese pop love song, bright tempo 100-110 BPM, catchy melody with memorable hooks, modern production with synthesizers, electric guitar riffs, bouncy bass lines, [VOCAL_TYPE] cheerful vocals with sweet harmonies, radio-friendly arrangement, uplifting and joyful mood, perfect for young couples, contemporary R&B influences, polished studio sound, celebration of new love and happiness, danceable rhythm, mainstream appeal with romantic lyrics', ARRAY['sweet female', 'male', 'alternating male and female'])
ON CONFLICT (id) DO NOTHING;

-- 插入系统配置
INSERT INTO system_configs (key, value, description) VALUES
('app_version', '"1.0.0"', '应用版本号'),
('maintenance_mode', 'false', '维护模式开关'),
('max_works_per_user', '10', '每个用户最大作品数量'),
('max_audio_file_size', '10485760', '音频文件最大大小(字节)'),
('supported_audio_formats', '["mp3", "wav", "m4a"]', '支持的音频格式')
ON CONFLICT (key) DO NOTHING;
