/**
 * 环境变量配置和验证工具
 */

// 环境类型
export type Environment = 'development' | 'production' | 'test';

// 获取当前环境
export function getEnvironment(): Environment {
  return (process.env.NODE_ENV as Environment) || 'development';
}

// 检查是否为开发环境
export function isDevelopment(): boolean {
  return getEnvironment() === 'development';
}

// 检查是否为生产环境
export function isProduction(): boolean {
  return getEnvironment() === 'production';
}

// 检查是否为测试环境
export function isTest(): boolean {
  return getEnvironment() === 'test';
}

// 环境变量配置接口
export interface EnvConfig {
  // 基础配置
  NODE_ENV: Environment;
  APP_ENV: string;
  APP_NAME: string;
  APP_NAME_EN: string;
  APP_DESCRIPTION: string;
  APP_URL: string;
  APP_VERSION: string;
  
  // 数据库配置
  DATABASE_URL?: string;
  DATABASE_HOST?: string;
  DATABASE_PORT?: number;
  DATABASE_NAME?: string;
  DATABASE_USER?: string;
  DATABASE_PASSWORD?: string;
  
  // Redis配置
  REDIS_URL?: string;
  REDIS_HOST?: string;
  REDIS_PORT?: number;
  REDIS_PASSWORD?: string;
  
  // AI服务配置
  SUNO_API_KEY?: string;
  SUNO_API_URL?: string;
  SUNO_WEBHOOK_SECRET?: string;
  OPENAI_API_KEY?: string;
  OPENAI_API_URL?: string;
  
  // 文件存储配置
  FILE_STORAGE_TYPE?: 'local' | 's3' | 'cos';
  FILE_STORAGE_PATH?: string;
  FILE_BASE_URL?: string;
  
  // 认证配置
  JWT_SECRET?: string;
  JWT_EXPIRES_IN?: string;
  
  // 邮件配置
  SMTP_HOST?: string;
  SMTP_PORT?: number;
  SMTP_USER?: string;
  SMTP_PASSWORD?: string;
  SMTP_FROM?: string;
  
  // 监控配置
  SENTRY_DSN?: string;
  LOG_LEVEL?: 'debug' | 'info' | 'warn' | 'error';
  
  // 安全配置
  CORS_ORIGIN?: string;
  ENCRYPTION_KEY?: string;
  RATE_LIMIT_WINDOW_MS?: number;
  RATE_LIMIT_MAX_REQUESTS?: number;
  
  // 开发配置
  DEBUG?: boolean;
  SKIP_EMAIL_VERIFICATION?: boolean;
  SKIP_PHONE_VERIFICATION?: boolean;
  ENABLE_TEST_DATA?: boolean;
}

// 获取环境变量配置
export function getEnvConfig(): EnvConfig {
  return {
    // 基础配置
    NODE_ENV: getEnvironment(),
    APP_ENV: process.env.NEXT_PUBLIC_APP_ENV || 'development',
    APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || '为爱而歌',
    APP_NAME_EN: process.env.NEXT_PUBLIC_APP_NAME_EN || 'StarWhisper',
    APP_DESCRIPTION: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'AI情歌创作平台',
    APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    
    // 数据库配置
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_HOST: process.env.DATABASE_HOST,
    DATABASE_PORT: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT) : undefined,
    DATABASE_NAME: process.env.DATABASE_NAME,
    DATABASE_USER: process.env.DATABASE_USER,
    DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
    
    // Redis配置
    REDIS_URL: process.env.REDIS_URL,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : undefined,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    
    // AI服务配置
    SUNO_API_KEY: process.env.SUNO_API_KEY,
    SUNO_API_URL: process.env.SUNO_API_URL,
    SUNO_WEBHOOK_SECRET: process.env.SUNO_WEBHOOK_SECRET,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_API_URL: process.env.OPENAI_API_URL,
    
    // 文件存储配置
    FILE_STORAGE_TYPE: process.env.FILE_STORAGE_TYPE as 'local' | 's3' | 'cos',
    FILE_STORAGE_PATH: process.env.FILE_STORAGE_PATH,
    FILE_BASE_URL: process.env.NEXT_PUBLIC_FILE_BASE_URL,
    
    // 认证配置
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    
    // 邮件配置
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    SMTP_FROM: process.env.SMTP_FROM,
    
    // 监控配置
    SENTRY_DSN: process.env.SENTRY_DSN,
    LOG_LEVEL: process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error',
    
    // 安全配置
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
    RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS ? parseInt(process.env.RATE_LIMIT_WINDOW_MS) : undefined,
    RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS ? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) : undefined,
    
    // 开发配置
    DEBUG: process.env.DEBUG === 'true',
    SKIP_EMAIL_VERIFICATION: process.env.SKIP_EMAIL_VERIFICATION === 'true',
    SKIP_PHONE_VERIFICATION: process.env.SKIP_PHONE_VERIFICATION === 'true',
    ENABLE_TEST_DATA: process.env.ENABLE_TEST_DATA === 'true',
  };
}

// 验证必需的环境变量
export function validateEnvConfig(config: EnvConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // 基础配置验证
  if (!config.APP_NAME) {
    errors.push('NEXT_PUBLIC_APP_NAME is required');
  }
  
  if (!config.APP_URL) {
    errors.push('NEXT_PUBLIC_APP_URL is required');
  }
  
  // 生产环境必需配置
  if (isProduction()) {
    if (!config.DATABASE_URL) {
      errors.push('DATABASE_URL is required in production');
    }
    
    if (!config.JWT_SECRET) {
      errors.push('JWT_SECRET is required in production');
    }
    
    if (!config.ENCRYPTION_KEY) {
      errors.push('ENCRYPTION_KEY is required in production');
    }
  }
  
  // AI服务配置验证
  if (!config.SUNO_API_KEY) {
    errors.push('SUNO_API_KEY is required for AI music generation');
  }
  
  if (!config.OPENAI_API_KEY) {
    errors.push('OPENAI_API_KEY is required for lyrics generation');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

// 获取环境变量并验证
export function getValidatedEnvConfig(): EnvConfig {
  const config = getEnvConfig();
  const validation = validateEnvConfig(config);
  
  if (!validation.isValid) {
    console.error('Environment configuration errors:', validation.errors);
    if (isProduction()) {
      throw new Error(`Environment configuration errors: ${validation.errors.join(', ')}`);
    }
  }
  
  return config;
}

// 导出配置实例
export const env = getValidatedEnvConfig();

// 常用环境检查函数
export const isDev = isDevelopment();
export const isProd = isProduction();
export const isTestEnv = isTest();
