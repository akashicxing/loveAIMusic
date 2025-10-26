const fs = require('fs');
const path = require('path');

// 读取env.txt文件
const envTxtPath = path.join(__dirname, '..', 'env.txt');
const envLocalPath = path.join(__dirname, '..', '.env.local');

console.log('📝 更新.env.local文件...');

try {
  // 读取env.txt内容
  const envTxtContent = fs.readFileSync(envTxtPath, 'utf8');
  
  // 提取腾讯云COS配置
  const cosConfig = envTxtContent
    .split('\n')
    .filter(line => line.startsWith('TENCENT_COS_'))
    .join('\n');
  
  console.log('📋 提取的COS配置:');
  console.log(cosConfig);
  
  // 读取.env.local文件
  let envLocalContent = fs.readFileSync(envLocalPath, 'utf8');
  
  // 移除旧的腾讯云COS配置
  envLocalContent = envLocalContent
    .split('\n')
    .filter(line => !line.startsWith('TENCENT_COS_'))
    .join('\n');
  
  // 添加新的腾讯云COS配置
  envLocalContent += '\n\n# 腾讯云COS存储配置\n' + cosConfig;
  
  // 写回.env.local文件
  fs.writeFileSync(envLocalPath, envLocalContent);
  
  console.log('✅ .env.local文件更新成功');
  
} catch (error) {
  console.error('❌ 更新失败:', error.message);
  process.exit(1);
}
