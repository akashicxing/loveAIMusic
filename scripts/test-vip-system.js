/**
 * VIP试用码系统测试脚本
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';
const ADMIN_SECRET = 'admin123456789';

async function testVipSystem() {
  console.log('🧪 开始测试VIP试用码系统...\n');

  try {
    // 1. 测试生成VIP试用码
    console.log('1️⃣ 测试生成VIP试用码...');
    const generateResponse = await fetch(`${BASE_URL}/api/admin/vip-codes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_SECRET}`
      },
      body: JSON.stringify({
        count: 3,
        vipDays: 7
      })
    });

    const generateResult = await generateResponse.json();
    console.log('生成结果:', generateResult);

    if (generateResult.success) {
      console.log('✅ 试用码生成成功');
      const testCode = generateResult.data.codes[0];
      console.log(`📝 测试用试用码: ${testCode}\n`);

      // 2. 测试查询VIP试用码
      console.log('2️⃣ 测试查询VIP试用码...');
      const queryResponse = await fetch(`${BASE_URL}/api/admin/vip-codes?status=active&limit=10`, {
        headers: {
          'Authorization': `Bearer ${ADMIN_SECRET}`
        }
      });

      const queryResult = await queryResponse.json();
      console.log('查询结果:', queryResult);

      if (queryResult.success) {
        console.log('✅ 试用码查询成功\n');

        // 3. 测试用户使用试用码
        console.log('3️⃣ 测试用户使用试用码...');
        const useResponse = await fetch(`${BASE_URL}/api/user/vip-trial`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            code: testCode
          })
        });

        const useResult = await useResponse.json();
        console.log('使用结果:', useResult);

        if (useResult.success) {
          console.log('✅ 试用码使用成功');
        } else {
          console.log('❌ 试用码使用失败:', useResult.error);
        }

        // 4. 测试查询用户VIP状态
        console.log('\n4️⃣ 测试查询用户VIP状态...');
        const statusResponse = await fetch(`${BASE_URL}/api/user/vip-trial`);

        const statusResult = await statusResponse.json();
        console.log('状态查询结果:', statusResult);

        if (statusResult.success) {
          console.log('✅ VIP状态查询成功');
        } else {
          console.log('❌ VIP状态查询失败:', statusResult.error);
        }

      } else {
        console.log('❌ 试用码查询失败:', queryResult.error);
      }

    } else {
      console.log('❌ 试用码生成失败:', generateResult.error);
    }

  } catch (error) {
    console.error('💥 测试过程中发生错误:', error);
  }

  console.log('\n🏁 VIP试用码系统测试完成');
}

// 运行测试
testVipSystem();
