/**
 * VIP试用码生成测试脚本
 * 注意：此脚本仅用于测试，不对外开放
 */

const crypto = require('crypto');

// 生成8位大写字母和数字的试用码
function generateTrialCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

// 生成多个试用码
function generateMultipleCodes(count = 5) {
  console.log(`🎫 生成 ${count} 个VIP试用码:\n`);
  
  const codes = [];
  for (let i = 0; i < count; i++) {
    const code = generateTrialCode();
    codes.push(code);
    console.log(`${i + 1}. ${code}`);
  }
  
  console.log(`\n✅ 成功生成 ${codes.length} 个试用码`);
  console.log(`📝 有效期: 3个月`);
  console.log(`🎁 VIP天数: 7天`);
  
  return codes;
}

// 运行测试
if (require.main === module) {
  generateMultipleCodes(10);
}

module.exports = { generateTrialCode, generateMultipleCodes };
