/**
 * 微信安全认证服务
 * 实现微信开放平台的安全鉴权模式
 * 文档: https://developers.weixin.qq.com/doc/oplatform/Website_App/guide/signature_verify.html
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export interface WeChatSecurityConfig {
  appId: string;
  appSecret: string;
  privateKeyPath?: string;
  publicKeyPath?: string;
  platformCertPath?: string;
  aesKey?: string;
}

export interface SignatureResult {
  signature: string;
  timestamp: string;
  nonce: string;
}

export interface EncryptResult {
  encryptedData: string;
  signature: string;
  timestamp: string;
  nonce: string;
}

export class WeChatSecurityService {
  private config: WeChatSecurityConfig;
  private privateKey?: string;
  private publicKey?: string;
  private platformCert?: string;

  constructor(config: WeChatSecurityConfig) {
    this.config = config;
    this.loadKeys();
  }

  /**
   * 加载密钥文件
   */
  private loadKeys() {
    try {
      // 加载应用私钥
      if (this.config.privateKeyPath && fs.existsSync(this.config.privateKeyPath)) {
        this.privateKey = fs.readFileSync(this.config.privateKeyPath, 'utf8');
        console.log('✅ [WeChat Security] 应用私钥加载成功');
      }

      // 加载应用公钥
      if (this.config.publicKeyPath && fs.existsSync(this.config.publicKeyPath)) {
        this.publicKey = fs.readFileSync(this.config.publicKeyPath, 'utf8');
        console.log('✅ [WeChat Security] 应用公钥加载成功');
      }

      // 加载平台证书
      if (this.config.platformCertPath && fs.existsSync(this.config.platformCertPath)) {
        this.platformCert = fs.readFileSync(this.config.platformCertPath, 'utf8');
        console.log('✅ [WeChat Security] 平台证书加载成功');
      }
    } catch (error) {
      console.error('❌ [WeChat Security] 密钥加载失败:', error);
    }
  }

  /**
   * 生成请求签名
   * 使用应用私钥对请求内容进行签名
   */
  generateSignature(data: string): SignatureResult {
    if (!this.privateKey) {
      throw new Error('应用私钥未配置');
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = crypto.randomBytes(16).toString('hex');
    
    // 构建签名字符串
    const signString = `${this.config.appId}\n${timestamp}\n${nonce}\n${data}`;
    
    // 使用私钥签名
    const signature = crypto
      .createSign('RSA-SHA256')
      .update(signString, 'utf8')
      .sign(this.privateKey, 'base64');

    return {
      signature,
      timestamp,
      nonce
    };
  }

  /**
   * 验证平台回调签名
   * 使用平台证书验证微信回调的签名
   */
  verifyPlatformSignature(data: string, signature: string, timestamp: string, nonce: string): boolean {
    if (!this.platformCert) {
      console.warn('⚠️ [WeChat Security] 平台证书未配置，跳过签名验证');
      return true; // 开发环境可能没有配置证书
    }

    try {
      // 构建验证字符串
      const verifyString = `${this.config.appId}\n${timestamp}\n${nonce}\n${data}`;
      
      // 使用平台证书验证签名
      const verifier = crypto.createVerify('RSA-SHA256');
      verifier.update(verifyString, 'utf8');
      
      return verifier.verify(this.platformCert, signature, 'base64');
    } catch (error) {
      console.error('❌ [WeChat Security] 签名验证失败:', error);
      return false;
    }
  }

  /**
   * AES256加密接口内容
   * 对请求内容进行AES256加密
   */
  encryptContent(data: string): EncryptResult {
    if (!this.config.aesKey) {
      throw new Error('AES密钥未配置');
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = crypto.randomBytes(16).toString('hex');
    
    // 生成随机IV
    const iv = crypto.randomBytes(16);
    
    // 创建加密器
    const cipher = crypto.createCipher('aes-256-cbc', this.config.aesKey);
    cipher.setAutoPadding(true);
    
    // 加密数据
    let encrypted = cipher.update(data, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    // 生成加密内容的签名
    const signResult = this.generateSignature(encrypted);

    return {
      encryptedData: encrypted,
      signature: signResult.signature,
      timestamp: signResult.timestamp,
      nonce: signResult.nonce
    };
  }

  /**
   * AES256解密接口内容
   * 对响应内容进行AES256解密
   */
  decryptContent(encryptedData: string): string {
    if (!this.config.aesKey) {
      throw new Error('AES密钥未配置');
    }

    try {
      // 创建解密器
      const decipher = crypto.createDecipher('aes-256-cbc', this.config.aesKey);
      decipher.setAutoPadding(true);
      
      // 解密数据
      let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('❌ [WeChat Security] 内容解密失败:', error);
      throw new Error('内容解密失败');
    }
  }

  /**
   * 生成带签名的请求头
   */
  generateSignedHeaders(data: string): Record<string, string> {
    const signResult = this.generateSignature(data);
    
    return {
      'X-WeChat-AppId': this.config.appId,
      'X-WeChat-Timestamp': signResult.timestamp,
      'X-WeChat-Nonce': signResult.nonce,
      'X-WeChat-Signature': signResult.signature
    };
  }

  /**
   * 验证请求头签名
   */
  verifyRequestSignature(data: string, headers: Record<string, string>): boolean {
    const { signature, timestamp, nonce } = headers;
    
    if (!signature || !timestamp || !nonce) {
      return false;
    }

    return this.verifyPlatformSignature(data, signature, timestamp, nonce);
  }

  /**
   * 生成微信API请求的完整签名
   * 用于调用微信开放平台API时的签名验证
   */
  generateWeChatAPISignature(params: Record<string, any>): string {
    // 按参数名ASCII码从小到大排序
    const sortedKeys = Object.keys(params).sort();
    const queryString = sortedKeys
      .map(key => `${key}=${params[key]}`)
      .join('&');

    // 添加appSecret
    const signString = `${queryString}&secret=${this.config.appSecret}`;
    
    // 生成MD5签名
    return crypto.createHash('md5').update(signString).digest('hex');
  }

  /**
   * 验证微信API响应签名
   */
  verifyWeChatAPISignature(data: any, signature: string): boolean {
    if (!data || typeof data !== 'object') {
      return false;
    }

    // 移除signature字段
    const { sign, ...params } = data;
    
    // 生成期望的签名
    const expectedSignature = this.generateWeChatAPISignature(params);
    
    return expectedSignature === signature;
  }

  /**
   * 获取安全配置状态
   */
  getSecurityStatus() {
    return {
      hasPrivateKey: !!this.privateKey,
      hasPublicKey: !!this.publicKey,
      hasPlatformCert: !!this.platformCert,
      hasAesKey: !!this.config.aesKey,
      isFullyConfigured: !!(this.privateKey && this.publicKey && this.platformCert && this.config.aesKey)
    };
  }

  /**
   * 生成密钥对（用于开发测试）
   */
  static generateKeyPair(): { privateKey: string; publicKey: string } {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    return { privateKey, publicKey };
  }

  /**
   * 生成AES密钥
   */
  static generateAESKey(): string {
    return crypto.randomBytes(32).toString('base64');
  }
}

// 导出单例
export const wechatSecurityService = new WeChatSecurityService({
  appId: process.env.WECHAT_APP_ID || '',
  appSecret: process.env.WECHAT_APP_SECRET || '',
  privateKeyPath: process.env.WECHAT_PRIVATE_KEY_PATH,
  publicKeyPath: process.env.WECHAT_PUBLIC_KEY_PATH,
  platformCertPath: process.env.WECHAT_PLATFORM_CERT_PATH,
  aesKey: process.env.WECHAT_AES_KEY
});
