const crypto = require('crypto');

// 配置信息 - 从环境变量读取
const config = {
  secretId: process.env.TENCENT_COS_SECRET_ID || 'your_secret_id',
  secretKey: process.env.TENCENT_COS_SECRET_KEY || 'your_secret_key',
  bucket: process.env.TENCENT_COS_BUCKET || 'your_bucket_name',
  region: process.env.TENCENT_COS_REGION || 'ap-beijing'
};

// 生成签名
function generateSignature(method, pathname, headers) {
  const { secretId, secretKey } = config;
  
  const signTime = Math.floor(Date.now() / 1000);
  const expireTime = signTime + 3600;
  
  const keyTime = `${signTime};${expireTime}`;
  
  const httpString = `${method.toLowerCase()}\n${pathname}\n\nhost=${config.bucket}.cos.${config.region}.myqcloud.com\n`;
  const stringToSign = `sha1\n${keyTime}\n${crypto.createHash('sha1').update(httpString).digest('hex')}\n`;
  
  const signKey = crypto.createHmac('sha1', secretKey).update(keyTime).digest('hex');
  const signature = crypto.createHmac('sha1', signKey).update(stringToSign).digest('hex');
  
  return `q-sign-algorithm=sha1&q-ak=${secretId}&q-sign-time=${keyTime}&q-key-time=${keyTime}&q-header-list=host&q-url-param-list=&q-signature=${signature}`;
}

// 测试存储桶访问
async function testBucketAccess() {
  console.log('🔍 测试腾讯云COS存储桶访问...');
  console.log('📝 存储桶:', config.bucket);
  console.log('📝 区域:', config.region);
  
  try {
    // 尝试列出存储桶内容
    const pathname = '/';
    const headers = {
      'host': `${config.bucket}.cos.${config.region}.myqcloud.com`
    };
    
    const authorization = generateSignature('GET', pathname, headers);
    const url = `https://${config.bucket}.cos.${config.region}.myqcloud.com${pathname}`;
    
    console.log('📤 请求URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': authorization
      }
    });
    
    console.log('📡 响应状态:', response.status, response.statusText);
    
    if (response.ok) {
      const result = await response.text();
      console.log('✅ 存储桶访问成功');
      console.log('📄 响应内容:', result.substring(0, 200) + '...');
    } else {
      const errorText = await response.text();
      console.log('❌ 存储桶访问失败');
      console.log('📄 错误信息:', errorText);
    }
    
  } catch (error) {
    console.error('💥 测试异常:', error.message);
  }
}

// 运行测试
testBucketAccess();
