/**
 * 腾讯云COS存储服务
 */

import crypto from 'crypto';

interface COSUploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

interface COSConfig {
  secretId: string;
  secretKey: string;
  bucket: string;
  region: string;
  pathPrefix: string;
}

export class COSService {
  private config: COSConfig;

  constructor() {
    this.config = {
      secretId: process.env.TENCENT_COS_SECRET_ID || '',
      secretKey: process.env.TENCENT_COS_SECRET_KEY || '',
      bucket: process.env.TENCENT_COS_BUCKET || '',
      region: process.env.TENCENT_COS_REGION || 'ap-hongkong',
      pathPrefix: process.env.TENCENT_COS_PATH_PREFIX || 'love/music/long'
    };

    console.log('🔧 [COS] 配置信息:', {
      secretId: this.config.secretId ? '已配置' : '未配置',
      secretKey: this.config.secretKey ? '已配置' : '未配置',
      bucket: this.config.bucket,
      region: this.config.region,
      pathPrefix: this.config.pathPrefix
    });

    if (!this.config.secretId || !this.config.secretKey || !this.config.bucket) {
      console.warn('⚠️ [COS] 腾讯云COS配置不完整，存储功能将不可用');
    }
  }

  /**
   * 生成COS签名
   */
  private generateSignature(method: string, pathname: string, headers: Record<string, string>): string {
    const { secretId, secretKey } = this.config;
    
    // 构建签名参数
    const signTime = Math.floor(Date.now() / 1000);
    const expireTime = signTime + 3600; // 1小时过期
    
    const keyTime = `${signTime};${expireTime}`;
    
    // 构建签名字符串
    const httpString = `${method.toLowerCase()}\n${pathname}\n\nhost=${this.config.bucket}.cos.${this.config.region}.myqcloud.com\n`;
    const stringToSign = `sha1\n${keyTime}\n${crypto.createHash('sha1').update(httpString).digest('hex')}\n`;
    
    // 生成签名
    const signKey = crypto.createHmac('sha1', secretKey).update(keyTime).digest('hex');
    const signature = crypto.createHmac('sha1', signKey).update(stringToSign).digest('hex');
    
    return `q-sign-algorithm=sha1&q-ak=${secretId}&q-sign-time=${keyTime}&q-key-time=${keyTime}&q-header-list=host&q-url-param-list=&q-signature=${signature}`;
  }

  /**
   * 上传文件到COS
   */
  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    contentType: string = 'audio/mpeg'
  ): Promise<COSUploadResult> {
    console.log('📤 [COS] 开始上传文件到腾讯云COS');
    console.log('📝 [COS] 文件名:', fileName);
    console.log('📝 [COS] 文件大小:', fileBuffer.length, 'bytes');
    console.log('📝 [COS] 内容类型:', contentType);

    if (!this.config.secretId || !this.config.secretKey || !this.config.bucket) {
      return {
        success: false,
        error: '腾讯云COS配置不完整'
      };
    }

    try {
      // 构建文件路径
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const fileKey = `${this.config.pathPrefix}/${timestamp}_${randomStr}_${fileName}`;
      const pathname = `/${fileKey}`;

      console.log('📝 [COS] 文件路径:', fileKey);

      // 生成签名
      const headers = {
        'host': `${this.config.bucket}.cos.${this.config.region}.myqcloud.com`,
        'content-type': contentType,
        'content-length': fileBuffer.length.toString()
      };

      const authorization = this.generateSignature('PUT', pathname, headers);

      // 构建请求URL
      const url = `https://${this.config.bucket}.cos.${this.config.region}.myqcloud.com${pathname}`;

      console.log('📤 [COS] 上传URL:', url);

      // 发送上传请求
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': authorization,
          'Content-Type': contentType,
          'Content-Length': fileBuffer.length.toString()
        },
        body: fileBuffer
      });

      console.log('📡 [COS] 响应状态:', response.status, response.statusText);

      if (response.ok) {
        const publicUrl = `https://${this.config.bucket}.cos.${this.config.region}.myqcloud.com${pathname}`;
        console.log('✅ [COS] 文件上传成功');
        console.log('🔗 [COS] 公开URL:', publicUrl);

        return {
          success: true,
          url: publicUrl,
          key: fileKey
        };
      } else {
        const errorText = await response.text();
        console.error('❌ [COS] 上传失败:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText
        });

        return {
          success: false,
          error: `上传失败: ${response.status} ${errorText}`
        };
      }

    } catch (error) {
      console.error('💥 [COS] 上传异常:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '上传异常'
      };
    }
  }

  /**
   * 从URL下载文件并上传到COS
   */
  async uploadFromUrl(
    fileUrl: string,
    fileName: string,
    contentType: string = 'audio/mpeg'
  ): Promise<COSUploadResult> {
    console.log('📥 [COS] 从URL下载文件并上传到COS');
    console.log('📝 [COS] 源URL:', fileUrl);
    console.log('📝 [COS] 目标文件名:', fileName);

    try {
      // 下载文件
      console.log('📥 [COS] 开始下载文件...');
      const response = await fetch(fileUrl);
      
      if (!response.ok) {
        return {
          success: false,
          error: `下载失败: ${response.status} ${response.statusText}`
        };
      }

      const fileBuffer = Buffer.from(await response.arrayBuffer());
      console.log('✅ [COS] 文件下载成功，大小:', fileBuffer.length, 'bytes');

      // 上传到COS
      return await this.uploadFile(fileBuffer, fileName, contentType);

    } catch (error) {
      console.error('💥 [COS] 下载或上传失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '下载或上传失败'
      };
    }
  }

  /**
   * 测试COS连接
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    console.log('🔍 [COS] 测试腾讯云COS连接');

    if (!this.config.secretId || !this.config.secretKey || !this.config.bucket) {
      return {
        success: false,
        error: 'COS配置不完整'
      };
    }

    try {
      // 创建一个小的测试文件
      const testContent = 'COS连接测试文件';
      const testBuffer = Buffer.from(testContent, 'utf-8');
      const testFileName = `test_${Date.now()}.txt`;

      console.log('📝 [COS] 创建测试文件:', testFileName);

      const result = await this.uploadFile(testBuffer, testFileName, 'text/plain');

      if (result.success) {
        console.log('✅ [COS] 连接测试成功');
        console.log('🔗 [COS] 测试文件URL:', result.url);
        return { success: true };
      } else {
        console.error('❌ [COS] 连接测试失败:', result.error);
        return { success: false, error: result.error };
      }

    } catch (error) {
      console.error('💥 [COS] 连接测试异常:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '连接测试异常'
      };
    }
  }
}

// 创建单例实例
export const cosService = new COSService();
