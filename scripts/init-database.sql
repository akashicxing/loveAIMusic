-- 创建数据库
CREATE DATABASE IF NOT EXISTS loveaimusic CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE loveaimusic;

-- 用户表
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  phone VARCHAR(20) UNIQUE,
  email VARCHAR(255),
  password_hash VARCHAR(255),
  nickname VARCHAR(100),
  avatar_url VARCHAR(500),
  vip_level ENUM('free', 'trial', 'vip') DEFAULT 'free',
  vip_expires_at TIMESTAMP NULL,
  credits INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
  -- 微信登录相关字段
  wechat_openid VARCHAR(50) UNIQUE,
  unionid VARCHAR(50),
  wechat_nickname VARCHAR(100),
  wechat_avatar VARCHAR(500),
  wechat_sex TINYINT DEFAULT 0 COMMENT '1男 2女 0未知',
  wechat_province VARCHAR(50),
  wechat_city VARCHAR(50),
  wechat_country VARCHAR(50),
  -- 登录类型
  login_type ENUM('phone', 'email', 'wechat') DEFAULT 'phone',
  INDEX idx_phone (phone),
  INDEX idx_email (email),
  INDEX idx_wechat_openid (wechat_openid),
  INDEX idx_unionid (unionid),
  INDEX idx_vip_level (vip_level),
  INDEX idx_status (status),
  INDEX idx_login_type (login_type)
);

-- 用户会话表
CREATE TABLE user_sessions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  login_type ENUM('phone', 'email', 'wechat') NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_session_token (session_token),
  INDEX idx_expires_at (expires_at),
  INDEX idx_login_type (login_type)
);

-- 微信token表
CREATE TABLE wechat_tokens (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  access_token VARCHAR(500) NOT NULL,
  refresh_token VARCHAR(500) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uk_user_id (user_id),
  INDEX idx_expires_at (expires_at)
);

-- VIP试用码表
CREATE TABLE vip_trial_codes (
  id VARCHAR(36) PRIMARY KEY,
  code VARCHAR(8) UNIQUE NOT NULL,
  vip_days INT NOT NULL DEFAULT 7,
  used_by VARCHAR(36) NULL,
  used_at TIMESTAMP NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('active', 'used', 'expired') DEFAULT 'active',
  FOREIGN KEY (used_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_code (code),
  INDEX idx_status (status),
  INDEX idx_expires_at (expires_at)
);

-- 短信验证码表
CREATE TABLE sms_codes (
  id VARCHAR(36) PRIMARY KEY,
  phone VARCHAR(20) NOT NULL,
  code VARCHAR(6) NOT NULL,
  type ENUM('register', 'reset_password', 'login') NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('active', 'used', 'expired') DEFAULT 'active',
  INDEX idx_phone (phone),
  INDEX idx_code (code),
  INDEX idx_type (type),
  INDEX idx_status (status),
  INDEX idx_expires_at (expires_at)
);

-- 音乐作品表
CREATE TABLE music_works (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  title VARCHAR(200) NOT NULL,
  lyrics TEXT NOT NULL,
  music_style_id VARCHAR(50) NOT NULL,
  music_style_name VARCHAR(100) NOT NULL,
  suno_task_id VARCHAR(100) NULL,
  status ENUM('pending', 'generating', 'completed', 'failed') DEFAULT 'pending',
  cos_file_url VARCHAR(500) NULL,
  cos_file_key VARCHAR(500) NULL,
  file_size BIGINT NULL,
  duration_seconds INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_suno_task_id (suno_task_id),
  INDEX idx_created_at (created_at)
);

-- 用户表单数据表
CREATE TABLE user_form_data (
  id VARCHAR(36) PRIMARY KEY,
  work_id VARCHAR(36) NOT NULL,
  round1_answers JSON NOT NULL,
  round2_answers JSON NOT NULL,
  selected_title VARCHAR(200) NULL,
  selected_version ENUM('A', 'B') NULL,
  song_structure JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (work_id) REFERENCES music_works(id) ON DELETE CASCADE,
  INDEX idx_work_id (work_id)
);

-- 积分记录表
CREATE TABLE credit_transactions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  type ENUM('earn', 'spend') NOT NULL,
  amount INT NOT NULL,
  description VARCHAR(200) NULL,
  related_work_id VARCHAR(36) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (related_work_id) REFERENCES music_works(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_type (type),
  INDEX idx_created_at (created_at)
);

-- 系统配置表
CREATE TABLE system_configs (
  id VARCHAR(36) PRIMARY KEY,
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_value TEXT NOT NULL,
  description VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_config_key (config_key)
);

-- 插入默认系统配置
INSERT INTO system_configs (id, config_key, config_value, description) VALUES
(UUID(), 'suno_poll_interval_minutes', '60', 'SunoAI状态轮询间隔(分钟)'),
(UUID(), 'vip_credits_per_month', '200', 'VIP用户每月积分'),
(UUID(), 'credits_per_generation', '20', '每次音乐生成消耗积分'),
(UUID(), 'trial_vip_days', '7', '试用VIP天数'),
(UUID(), 'sms_code_expires_minutes', '5', '短信验证码过期时间(分钟)'),
(UUID(), 'sms_send_limit_per_hour', '5', '每小时短信发送限制');

-- 创建一些测试用的VIP试用码
INSERT INTO vip_trial_codes (id, code, vip_days, expires_at) VALUES
(UUID(), 'TRIAL01', 7, DATE_ADD(NOW(), INTERVAL 90 DAY)),
(UUID(), 'TRIAL02', 7, DATE_ADD(NOW(), INTERVAL 90 DAY)),
(UUID(), 'TRIAL03', 7, DATE_ADD(NOW(), INTERVAL 90 DAY)),
(UUID(), 'TRIAL04', 7, DATE_ADD(NOW(), INTERVAL 90 DAY)),
(UUID(), 'TRIAL05', 7, DATE_ADD(NOW(), INTERVAL 90 DAY));
