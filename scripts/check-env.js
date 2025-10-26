#!/usr/bin/env node

/**
 * 环境变量检查脚本
 * 用于验证环境变量配置是否正确
 */

const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

// 必需的环境变量
const requiredEnvVars = {
  development: [
    'NEXT_PUBLIC_APP_NAME',
    'NEXT_PUBLIC_APP_URL',
    'NEXT_PUBLIC_APP_VERSION',
  ],
  production: [
    'NEXT_PUBLIC_APP_NAME',
    'NEXT_PUBLIC_APP_URL',
    'NEXT_PUBLIC_APP_VERSION',
    'DATABASE_URL',
    'JWT_SECRET',
    'ENCRYPTION_KEY',
    'SUNO_API_KEY',
    'OPENAI_API_KEY',
  ],
};

// 可选的环境变量
const optionalEnvVars = [
  'DATABASE_HOST',
  'DATABASE_PORT',
  'DATABASE_NAME',
  'DATABASE_USER',
  'DATABASE_PASSWORD',
  'REDIS_URL',
  'REDIS_HOST',
  'REDIS_PORT',
  'REDIS_PASSWORD',
  'SUNO_API_URL',
  'SUNO_WEBHOOK_SECRET',
  'OPENAI_API_URL',
  'FILE_STORAGE_TYPE',
  'FILE_STORAGE_PATH',
  'NEXT_PUBLIC_FILE_BASE_URL',
  'JWT_EXPIRES_IN',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASSWORD',
  'SMTP_FROM',
  'SENTRY_DSN',
  'LOG_LEVEL',
  'CORS_ORIGIN',
  'RATE_LIMIT_WINDOW_MS',
  'RATE_LIMIT_MAX_REQUESTS',
  'DEBUG',
  'NEXT_PUBLIC_DEBUG',
  'SKIP_EMAIL_VERIFICATION',
  'SKIP_PHONE_VERIFICATION',
  'ENABLE_TEST_DATA',
];

function checkEnvFile() {
  const envFile = path.join(process.cwd(), '.env.local');
  const envExampleFile = path.join(process.cwd(), 'ENV_TEMPLATE.txt');
  
  console.log(colorize('🔍 检查环境变量文件...', 'cyan'));
  
  // 检查 .env.local 文件是否存在
  if (!fs.existsSync(envFile)) {
    console.log(colorize('❌ .env.local 文件不存在', 'red'));
    console.log(colorize('💡 请复制 ENV_TEMPLATE.txt 为 .env.local 并配置相应值', 'yellow'));
    return false;
  }
  
  console.log(colorize('✅ .env.local 文件存在', 'green'));
  
  // 检查模板文件是否存在
  if (!fs.existsSync(envExampleFile)) {
    console.log(colorize('⚠️  ENV_TEMPLATE.txt 文件不存在', 'yellow'));
  } else {
    console.log(colorize('✅ ENV_TEMPLATE.txt 文件存在', 'green'));
  }
  
  return true;
}

function checkEnvVars() {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const required = requiredEnvVars[nodeEnv] || requiredEnvVars.development;
  
  console.log(colorize(`\n🔍 检查 ${nodeEnv} 环境变量...`, 'cyan'));
  
  const missing = [];
  const present = [];
  const optional = [];
  
  // 检查必需的环境变量
  required.forEach(envVar => {
    if (process.env[envVar]) {
      present.push(envVar);
    } else {
      missing.push(envVar);
    }
  });
  
  // 检查可选的环境变量
  optionalEnvVars.forEach(envVar => {
    if (process.env[envVar]) {
      optional.push(envVar);
    }
  });
  
  // 输出结果
  console.log(colorize(`\n📊 环境变量统计:`, 'blue'));
  console.log(colorize(`✅ 已配置的必需变量: ${present.length}/${required.length}`, 'green'));
  console.log(colorize(`⚠️  缺失的必需变量: ${missing.length}`, missing.length > 0 ? 'red' : 'green'));
  console.log(colorize(`ℹ️  已配置的可选变量: ${optional.length}/${optionalEnvVars.length}`, 'cyan'));
  
  // 显示缺失的变量
  if (missing.length > 0) {
    console.log(colorize(`\n❌ 缺失的必需环境变量:`, 'red'));
    missing.forEach(envVar => {
      console.log(colorize(`   - ${envVar}`, 'red'));
    });
  }
  
  // 显示已配置的变量
  if (present.length > 0) {
    console.log(colorize(`\n✅ 已配置的必需环境变量:`, 'green'));
    present.forEach(envVar => {
      const value = process.env[envVar];
      const displayValue = value.length > 50 ? value.substring(0, 50) + '...' : value;
      console.log(colorize(`   - ${envVar}: ${displayValue}`, 'green'));
    });
  }
  
  // 显示可选变量
  if (optional.length > 0) {
    console.log(colorize(`\nℹ️  已配置的可选环境变量:`, 'cyan'));
    optional.forEach(envVar => {
      const value = process.env[envVar];
      const displayValue = value.length > 50 ? value.substring(0, 50) + '...' : value;
      console.log(colorize(`   - ${envVar}: ${displayValue}`, 'cyan'));
    });
  }
  
  return missing.length === 0;
}

function checkSecurity() {
  console.log(colorize(`\n🔒 安全检查...`, 'cyan'));
  
  const securityIssues = [];
  
  // 检查是否在生产环境使用默认值
  if (process.env.NODE_ENV === 'production') {
    if (process.env.JWT_SECRET === 'your_jwt_secret_key_for_development') {
      securityIssues.push('JWT_SECRET 使用默认值，生产环境不安全');
    }
    
    if (process.env.ENCRYPTION_KEY === 'your_encryption_key_for_development') {
      securityIssues.push('ENCRYPTION_KEY 使用默认值，生产环境不安全');
    }
    
    if (process.env.DEBUG === 'true') {
      securityIssues.push('生产环境启用了 DEBUG 模式');
    }
    
    if (process.env.SKIP_EMAIL_VERIFICATION === 'true') {
      securityIssues.push('生产环境跳过了邮箱验证');
    }
  }
  
  // 检查弱密码
  const weakPasswords = ['password', '123456', 'admin', 'test'];
  if (process.env.DATABASE_PASSWORD && weakPasswords.includes(process.env.DATABASE_PASSWORD)) {
    securityIssues.push('数据库密码过于简单');
  }
  
  if (securityIssues.length > 0) {
    console.log(colorize(`\n⚠️  发现安全问题:`, 'yellow'));
    securityIssues.forEach(issue => {
      console.log(colorize(`   - ${issue}`, 'yellow'));
    });
  } else {
    console.log(colorize(`\n✅ 安全检查通过`, 'green'));
  }
  
  return securityIssues.length === 0;
}

function main() {
  console.log(colorize('🚀 为爱而歌 - 环境变量检查工具', 'magenta'));
  console.log(colorize('=====================================', 'magenta'));
  
  // 检查环境文件
  const envFileExists = checkEnvFile();
  
  if (!envFileExists) {
    console.log(colorize('\n❌ 环境变量检查失败', 'red'));
    process.exit(1);
  }
  
  // 检查环境变量
  const envVarsValid = checkEnvVars();
  
  // 安全检查
  const securityValid = checkSecurity();
  
  // 总结
  console.log(colorize('\n📋 检查总结:', 'blue'));
  console.log(colorize(`   环境文件: ${envFileExists ? '✅' : '❌'}`, envFileExists ? 'green' : 'red'));
  console.log(colorize(`   环境变量: ${envVarsValid ? '✅' : '❌'}`, envVarsValid ? 'green' : 'red'));
  console.log(colorize(`   安全检查: ${securityValid ? '✅' : '❌'}`, securityValid ? 'green' : 'red'));
  
  if (envFileExists && envVarsValid && securityValid) {
    console.log(colorize('\n🎉 环境变量配置检查通过！', 'green'));
    process.exit(0);
  } else {
    console.log(colorize('\n❌ 环境变量配置检查失败，请修复上述问题', 'red'));
    process.exit(1);
  }
}

// 运行检查
if (require.main === module) {
  main();
}

module.exports = {
  checkEnvFile,
  checkEnvVars,
  checkSecurity,
};
