#!/usr/bin/env node

/**
 * 微信登录配置检查工具
 * 检查微信登录相关的环境变量和配置是否正确
 */

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

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    log(`✅ ${description}: ${filePath}`, 'green');
    return true;
  } else {
    log(`❌ ${description}: ${filePath} (文件不存在)`, 'red');
    return false;
  }
}

function checkEnvFile() {
  log('\n🔍 检查环境变量文件...', 'blue');
  
  const envFiles = [
    '.env.local',
    '.env.production',
    '.env'
  ];
  
  let foundEnvFile = false;
  for (const envFile of envFiles) {
    if (fs.existsSync(envFile)) {
      log(`✅ 找到环境变量文件: ${envFile}`, 'green');
      foundEnvFile = true;
      
      // 读取并检查微信相关配置
      const envContent = fs.readFileSync(envFile, 'utf8');
      const wechatConfigs = [
        'WECHAT_APP_ID',
        'WECHAT_APP_SECRET',
        'WECHAT_REDIRECT_URI',
        'JWT_SECRET'
      ];
      
      log('\n📋 检查微信登录配置:', 'yellow');
      wechatConfigs.forEach(config => {
        if (envContent.includes(config)) {
          const match = envContent.match(new RegExp(`${config}=(.+)`));
          if (match && match[1] && !match[1].includes('your_')) {
            log(`  ✅ ${config}: 已配置`, 'green');
          } else {
            log(`  ⚠️  ${config}: 需要配置真实值`, 'yellow');
          }
        } else {
          log(`  ❌ ${config}: 未配置`, 'red');
        }
      });
      
      break;
    }
  }
  
  if (!foundEnvFile) {
    log('❌ 未找到环境变量文件', 'red');
    log('请创建 .env.local 文件并配置微信登录相关变量', 'yellow');
  }
  
  return foundEnvFile;
}

function checkProjectFiles() {
  log('\n🔍 检查项目文件...', 'blue');
  
  const requiredFiles = [
    { path: 'lib/wechatService.ts', desc: '微信登录服务' },
    { path: 'app/api/auth/wechat/route.ts', desc: '微信登录API' },
    { path: 'app/api/auth/wechat/ticket/route.ts', desc: 'PC OpenSDK Ticket API' },
    { path: 'components/WeChatLogin.tsx', desc: '微信登录组件' },
    { path: 'app/login/page.tsx', desc: '登录页面' },
    { path: 'app/auth/wechat/callback/page.tsx', desc: '微信登录回调页面' },
    { path: 'scripts/init-database.sql', desc: '数据库初始化脚本' }
  ];
  
  let allFilesExist = true;
  requiredFiles.forEach(file => {
    if (!checkFile(file.path, file.desc)) {
      allFilesExist = false;
    }
  });
  
  return allFilesExist;
}

function checkDatabaseSchema() {
  log('\n🔍 检查数据库Schema...', 'blue');
  
  const sqlFile = 'scripts/init-database.sql';
  if (fs.existsSync(sqlFile)) {
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    const requiredTables = [
      'wechat_openid',
      'unionid',
      'wechat_nickname',
      'wechat_avatar',
      'wechat_tokens'
    ];
    
    log('📋 检查微信相关字段和表:', 'yellow');
    requiredTables.forEach(table => {
      if (sqlContent.includes(table)) {
        log(`  ✅ ${table}: 已定义`, 'green');
      } else {
        log(`  ❌ ${table}: 未定义`, 'red');
      }
    });
    
    return true;
  } else {
    log('❌ 数据库初始化脚本不存在', 'red');
    return false;
  }
}

function generateConfigTemplate() {
  log('\n📝 生成配置模板...', 'blue');
  
  const template = `# 微信登录配置模板
# 请将以下配置添加到您的 .env.local 文件中

# 微信登录配置
WECHAT_APP_ID=your_wechat_app_id_here
WECHAT_APP_SECRET=your_wechat_app_secret_here
WECHAT_REDIRECT_URI=https://yourdomain.com/auth/wechat/callback

# JWT配置
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# 数据库配置（如果使用MySQL）
MYSQL_HOST=your_mysql_host
MYSQL_PORT=3306
MYSQL_USER=your_mysql_user
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=your_database_name
MYSQL_SSL=true
`;

  fs.writeFileSync('wechat-config-template.env', template);
  log('✅ 配置模板已生成: wechat-config-template.env', 'green');
}

function main() {
  log('🚀 微信登录配置检查工具', 'bold');
  log('=' .repeat(50), 'blue');
  
  let allChecksPassed = true;
  
  // 检查环境变量文件
  const envFileExists = checkEnvFile();
  if (!envFileExists) allChecksPassed = false;
  
  // 检查项目文件
  const filesExist = checkProjectFiles();
  if (!filesExist) allChecksPassed = false;
  
  // 检查数据库Schema
  const schemaExists = checkDatabaseSchema();
  if (!schemaExists) allChecksPassed = false;
  
  // 生成配置模板
  generateConfigTemplate();
  
  log('\n' + '=' .repeat(50), 'blue');
  
  if (allChecksPassed) {
    log('🎉 所有检查通过！微信登录功能已准备就绪', 'green');
    log('\n📋 下一步操作:', 'yellow');
    log('1. 在微信开放平台创建网站应用', 'blue');
    log('2. 配置授权回调域名', 'blue');
    log('3. 获取AppID和AppSecret', 'blue');
    log('4. 更新环境变量配置', 'blue');
    log('5. 运行数据库初始化脚本', 'blue');
    log('6. 启动应用并测试登录功能', 'blue');
  } else {
    log('⚠️  部分检查未通过，请根据上述提示进行修复', 'yellow');
  }
  
  log('\n📚 更多信息请查看: WECHAT_LOGIN_GUIDE.md', 'blue');
}

// 运行检查
main();
