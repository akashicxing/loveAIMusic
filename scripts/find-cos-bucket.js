const crypto = require('crypto');

// 配置信息 - 从环境变量读取
const config = {
  secretId: process.env.TENCENT_COS_SECRET_ID || 'your_secret_id',
  secretKey: process.env.TENCENT_COS_SECRET_KEY || 'your_secret_key',
  bucket: process.env.TENCENT_COS_BUCKET || 'your_bucket_name'
};

// 可能的区域列表
const regions = [
  'ap-beijing',
  'ap-beijing-1',
  'ap-beijing-2',
  'ap-shanghai',
  'ap-shanghai-1',
  'ap-shanghai-2',
  'ap-guangzhou',
  'ap-guangzhou-1',
  'ap-guangzhou-2',
  'ap-hongkong',
  'ap-hongkong-1',
  'ap-singapore',
  'ap-singapore-1',
  'ap-tokyo',
  'ap-tokyo-1',
  'ap-mumbai',
  'ap-mumbai-1',
  'ap-seoul',
  'ap-seoul-1',
  'na-siliconvalley',
  'na-siliconvalley-1',
  'na-ashburn',
  'na-ashburn-1',
  'eu-frankfurt',
  'eu-frankfurt-1',
  'eu-moscow',
  'eu-moscow-1'
];

// 生成签名
function generateSignature(method, pathname, headers, region) {
  const { secretId, secretKey } = config;
  
  const signTime = Math.floor(Date.now() / 1000);
  const expireTime = signTime + 3600;
  
  const keyTime = `${signTime};${expireTime}`;
  
  const httpString = `${method.toLowerCase()}\n${pathname}\n\nhost=${config.bucket}.cos.${region}.myqcloud.com\n`;
  const stringToSign = `sha1\n${keyTime}\n${crypto.createHash('sha1').update(httpString).digest('hex')}\n`;
  
  const signKey = crypto.createHmac('sha1', secretKey).update(keyTime).digest('hex');
  const signature = crypto.createHmac('sha1', signKey).update(stringToSign).digest('hex');
  
  return `q-sign-algorithm=sha1&q-ak=${secretId}&q-sign-time=${keyTime}&q-key-time=${keyTime}&q-header-list=host&q-url-param-list=&q-signature=${signature}`;
}

// 测试特定区域
async function testRegion(region) {
  try {
    const pathname = '/';
    const headers = {
      'host': `${config.bucket}.cos.${region}.myqcloud.com`
    };
    
    const authorization = generateSignature('GET', pathname, headers, region);
    const url = `https://${config.bucket}.cos.${region}.myqcloud.com${pathname}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': authorization
      }
    });
    
    if (response.ok) {
      console.log(`✅ 找到存储桶！区域: ${region}`);
      return region;
    } else if (response.status === 403) {
      console.log(`🔒 存储桶存在但无权限访问，区域: ${region}`);
      return region;
    } else {
      console.log(`❌ 区域 ${region} 不存在存储桶`);
    }
    
  } catch (error) {
    console.log(`💥 区域 ${region} 测试异常: ${error.message}`);
  }
  
  return null;
}

// 查找存储桶
async function findBucket() {
  console.log('🔍 查找腾讯云COS存储桶...');
  console.log('📝 存储桶名称:', config.bucket);
  console.log('📝 测试区域数量:', regions.length);
  
  for (const region of regions) {
    const foundRegion = await testRegion(region);
    if (foundRegion) {
      console.log(`🎉 存储桶找到！正确区域: ${foundRegion}`);
      return foundRegion;
    }
    
    // 避免请求过于频繁
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('❌ 未找到存储桶，请检查存储桶名称或权限');
  return null;
}

// 运行查找
findBucket();
