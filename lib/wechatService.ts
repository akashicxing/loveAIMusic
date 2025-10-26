/**
 * 微信登录服务
 * 基于微信开放平台网站应用PC端登录API
 * 文档: https://developers.weixin.qq.com/doc/oplatform/Website_App/WeChat_PC_APIs/guideline.html
 */

import fetch from 'node-fetch';
import { wechatSecurityService } from './wechatSecurityService';

export interface WeChatUserInfo {
  openid: string;
  unionid?: string;
  nickname: string;
  sex: number; // 1男 2女 0未知
  province: string;
  city: string;
  country: string;
  headimgurl: string;
  privilege: string[];
}

export interface WeChatAccessToken {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  openid: string;
  scope: string;
  unionid?: string;
}

export interface WeChatTicket {
  ticket: string;
  expires_in: number;
}

export interface WeChatError {
  errcode: number;
  errmsg: string;
}

export class WeChatService {
  private appId: string;
  private appSecret: string;
  private redirectUri: string;

  constructor() {
    this.appId = process.env.WECHAT_APP_ID || '';
    this.appSecret = process.env.WECHAT_APP_SECRET || '';
    this.redirectUri = process.env.WECHAT_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/auth/wechat/callback`;
    
    if (!this.appId || !this.appSecret) {
      console.warn('⚠️ [WeChat] 微信登录配置不完整，请检查环境变量 WECHAT_APP_ID 和 WECHAT_APP_SECRET');
    }
  }

  /**
   * 生成微信登录授权URL
   */
  generateAuthUrl(state?: string): string {
    const params = new URLSearchParams({
      appid: this.appId,
      redirect_uri: encodeURIComponent(this.redirectUri),
      response_type: 'code',
      scope: 'snsapi_base',
      state: state || 'wechat_login'
    });

    return `https://open.weixin.qq.com/connect/qrconnect?${params.toString()}#wechat_redirect`;
  }

  /**
   * 通过授权码获取access_token
   */
  async getAccessToken(code: string): Promise<WeChatAccessToken | WeChatError> {
    const url = 'https://api.weixin.qq.com/sns/oauth2/access_token';
    const params = new URLSearchParams({
      appid: this.appId,
      secret: this.appSecret,
      code: code,
      grant_type: 'authorization_code'
    });

    try {
      console.log('🔐 [WeChat] 获取access_token:', { code: code.substring(0, 10) + '...' });
      
      const response = await fetch(`${url}?${params.toString()}`);
      const data = await response.json() as WeChatAccessToken | WeChatError;

      if ('errcode' in data) {
        console.error('❌ [WeChat] 获取access_token失败:', data);
        return data;
      }

      // 验证响应签名（如果启用了安全认证）
      const securityStatus = wechatSecurityService.getSecurityStatus();
      if (securityStatus.isFullyConfigured && 'signature' in data) {
        const isValid = wechatSecurityService.verifyWeChatAPISignature(data, data.signature as string);
        if (!isValid) {
          console.warn('⚠️ [WeChat] 响应签名验证失败');
        }
      }

      console.log('✅ [WeChat] 获取access_token成功');
      return data;
    } catch (error) {
      console.error('❌ [WeChat] 获取access_token异常:', error);
      return {
        errcode: -1,
        errmsg: '网络请求失败'
      };
    }
  }

  /**
   * 通过access_token获取用户信息
   */
  async getUserInfo(accessToken: string, openid: string): Promise<WeChatUserInfo | WeChatError> {
    const url = 'https://api.weixin.qq.com/sns/userinfo';
    const params = new URLSearchParams({
      access_token: accessToken,
      openid: openid
    });

    try {
      console.log('👤 [WeChat] 获取用户信息:', { openid: openid.substring(0, 10) + '...' });
      
      const response = await fetch(`${url}?${params.toString()}`);
      const data = await response.json() as WeChatUserInfo | WeChatError;

      if ('errcode' in data) {
        console.error('❌ [WeChat] 获取用户信息失败:', data);
        return data;
      }

      console.log('✅ [WeChat] 获取用户信息成功:', { nickname: data.nickname });
      return data;
    } catch (error) {
      console.error('❌ [WeChat] 获取用户信息异常:', error);
      return {
        errcode: -1,
        errmsg: '网络请求失败'
      };
    }
  }

  /**
   * 获取PC OpenSDK的ticket
   * 用于调用PC端微信能力
   */
  async getPCOpenSDKTicket(accessToken: string): Promise<WeChatTicket | WeChatError> {
    const url = 'https://api.weixin.qq.com/cgi-bin/pcopensdk/ticket';
    const params = new URLSearchParams({
      access_token: accessToken
    });

    try {
      console.log('🎫 [WeChat] 获取PC OpenSDK ticket');
      
      const requestBody = {
        ticket_type: 'pcopensdk'
      };

      // 如果启用了安全认证，对请求内容进行加密和签名
      const securityStatus = wechatSecurityService.getSecurityStatus();
      let headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      let body = JSON.stringify(requestBody);

      if (securityStatus.isFullyConfigured) {
        try {
          // 加密请求内容
          const encryptResult = wechatSecurityService.encryptContent(body);
          body = JSON.stringify({
            encrypted_data: encryptResult.encryptedData,
            signature: encryptResult.signature,
            timestamp: encryptResult.timestamp,
            nonce: encryptResult.nonce
          });

          // 添加安全认证头
          const signedHeaders = wechatSecurityService.generateSignedHeaders(body);
          headers = { ...headers, ...signedHeaders };

          console.log('🔒 [WeChat] 使用安全认证模式获取ticket');
        } catch (error) {
          console.warn('⚠️ [WeChat] 安全认证配置失败，使用普通模式:', error);
        }
      }
      
      const response = await fetch(`${url}?${params.toString()}`, {
        method: 'POST',
        headers,
        body
      });

      const data = await response.json() as WeChatTicket | WeChatError;

      if ('errcode' in data) {
        console.error('❌ [WeChat] 获取PC OpenSDK ticket失败:', data);
        return data;
      }

      // 如果响应是加密的，进行解密
      if ('encrypted_data' in data && securityStatus.isFullyConfigured) {
        try {
          const decryptedData = wechatSecurityService.decryptContent(data.encrypted_data as string);
          const parsedData = JSON.parse(decryptedData);
          console.log('✅ [WeChat] 获取PC OpenSDK ticket成功（已解密）');
          return parsedData;
        } catch (error) {
          console.warn('⚠️ [WeChat] 响应解密失败，返回原始数据:', error);
        }
      }

      console.log('✅ [WeChat] 获取PC OpenSDK ticket成功');
      return data;
    } catch (error) {
      console.error('❌ [WeChat] 获取PC OpenSDK ticket异常:', error);
      return {
        errcode: -1,
        errmsg: '网络请求失败'
      };
    }
  }

  /**
   * 刷新access_token
   */
  async refreshAccessToken(refreshToken: string): Promise<WeChatAccessToken | WeChatError> {
    const url = 'https://api.weixin.qq.com/sns/oauth2/refresh_token';
    const params = new URLSearchParams({
      appid: this.appId,
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    });

    try {
      console.log('🔄 [WeChat] 刷新access_token');
      
      const response = await fetch(`${url}?${params.toString()}`);
      const data = await response.json() as WeChatAccessToken | WeChatError;

      if ('errcode' in data) {
        console.error('❌ [WeChat] 刷新access_token失败:', data);
        return data;
      }

      console.log('✅ [WeChat] 刷新access_token成功');
      return data;
    } catch (error) {
      console.error('❌ [WeChat] 刷新access_token异常:', error);
      return {
        errcode: -1,
        errmsg: '网络请求失败'
      };
    }
  }

  /**
   * 验证access_token是否有效
   */
  async validateAccessToken(accessToken: string, openid: string): Promise<boolean> {
    const url = 'https://api.weixin.qq.com/sns/auth';
    const params = new URLSearchParams({
      access_token: accessToken,
      openid: openid
    });

    try {
      const response = await fetch(`${url}?${params.toString()}`);
      const data = await response.json() as { errcode: number; errmsg: string };

      return data.errcode === 0;
    } catch (error) {
      console.error('❌ [WeChat] 验证access_token异常:', error);
      return false;
    }
  }

  /**
   * 获取配置信息
   */
  getConfig() {
    return {
      appId: this.appId,
      redirectUri: this.redirectUri,
      isConfigured: !!(this.appId && this.appSecret)
    };
  }
}

// 导出单例
export const wechatService = new WeChatService();
