/**
 * 存储服务
 * 处理文件上传到腾讯云COS和数据库操作
 */

import COS from 'cos-nodejs-sdk-v5';

export interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

export interface FileInfo {
  originalName: string;
  fileName: string;
  filePath: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  fileType: 'lyrics' | 'audio' | 'image';
}

class StorageService {
  private cos: COS;
  private bucket: string;
  private region: string;
  private baseUrl: string;

  constructor() {
    this.cos = new COS({
      SecretId: process.env.TENCENT_SECRET_ID || '',
      SecretKey: process.env.TENCENT_SECRET_KEY || '',
    });
    
    this.bucket = process.env.TENCENT_COS_BUCKET || 'loveaimusic';
    this.region = process.env.TENCENT_COS_REGION || 'ap-shanghai';
    this.baseUrl = process.env.NEXT_PUBLIC_FILE_BASE_URL || 'https://pic.pandaswap.fun';
  }

  /**
   * 上传歌词文件到云存储
   */
  async uploadLyrics(lyrics: string, songTitle: string, userId: string): Promise<UploadResult> {
    try {
      const fileName = `lyrics/${userId}/${Date.now()}_${songTitle.replace(/[^\w\s]/gi, '')}.txt`;
      const buffer = Buffer.from(lyrics, 'utf8');

      const result = await this.uploadFile(buffer, fileName, 'text/plain');
      
      if (result.success) {
        return {
          success: true,
          url: result.url,
          key: result.key
        };
      }

      return result;
    } catch (error) {
      console.error('上传歌词失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '上传歌词失败'
      };
    }
  }

  /**
   * 上传音频文件到云存储
   */
  async uploadAudio(audioBuffer: Buffer, songTitle: string, userId: string): Promise<UploadResult> {
    try {
      const fileName = `audio/${userId}/${Date.now()}_${songTitle.replace(/[^\w\s]/gi, '')}.mp3`;

      const result = await this.uploadFile(audioBuffer, fileName, 'audio/mpeg');
      
      if (result.success) {
        return {
          success: true,
          url: result.url,
          key: result.key
        };
      }

      return result;
    } catch (error) {
      console.error('上传音频失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '上传音频失败'
      };
    }
  }

  /**
   * 上传图片文件到云存储
   */
  async uploadImage(imageBuffer: Buffer, fileName: string, userId: string): Promise<UploadResult> {
    try {
      const filePath = `images/${userId}/${Date.now()}_${fileName}`;

      const result = await this.uploadFile(imageBuffer, filePath, 'image/jpeg');
      
      if (result.success) {
        return {
          success: true,
          url: result.url,
          key: result.key
        };
      }

      return result;
    } catch (error) {
      console.error('上传图片失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '上传图片失败'
      };
    }
  }

  /**
   * 通用文件上传方法
   */
  private async uploadFile(buffer: Buffer, key: string, contentType: string): Promise<UploadResult> {
    return new Promise((resolve) => {
      this.cos.putObject({
        Bucket: this.bucket,
        Region: this.region,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }, (err, data) => {
        if (err) {
          console.error('COS上传失败:', err);
          resolve({
            success: false,
            error: err.message || '文件上传失败'
          });
        } else {
          const fileUrl = `${this.baseUrl}/${key}`;
          resolve({
            success: true,
            url: fileUrl,
            key: key
          });
        }
      });
    });
  }

  /**
   * 删除文件
   */
  async deleteFile(key: string): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      this.cos.deleteObject({
        Bucket: this.bucket,
        Region: this.region,
        Key: key,
      }, (err) => {
        if (err) {
          console.error('删除文件失败:', err);
          resolve({
            success: false,
            error: err.message || '删除文件失败'
          });
        } else {
          resolve({ success: true });
        }
      });
    });
  }

  /**
   * 生成预签名URL（用于临时访问）
   */
  async generatePresignedUrl(key: string, expires: number = 3600): Promise<string> {
    return new Promise((resolve, reject) => {
      this.cos.getObjectUrl({
        Bucket: this.bucket,
        Region: this.region,
        Key: key,
        Sign: true,
        Expires: expires,
      }, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data.Url);
        }
      });
    });
  }

  /**
   * 验证存储配置
   */
  validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!process.env.TENCENT_SECRET_ID) {
      errors.push('腾讯云SecretId未配置');
    }

    if (!process.env.TENCENT_SECRET_KEY) {
      errors.push('腾讯云SecretKey未配置');
    }

    if (!this.bucket) {
      errors.push('COS存储桶名称未配置');
    }

    if (!this.region) {
      errors.push('COS地域未配置');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 测试存储连接
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      // 尝试列出存储桶内容来测试连接
      return new Promise((resolve) => {
        this.cos.getBucket({
          Bucket: this.bucket,
          Region: this.region,
          MaxKeys: 1,
        }, (err) => {
          if (err) {
            resolve({
              success: false,
              error: err.message || '连接测试失败'
            });
          } else {
            resolve({ success: true });
          }
        });
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '连接测试失败'
      };
    }
  }
}

// 导出单例实例
export const storageService = new StorageService();

// 导出类型
