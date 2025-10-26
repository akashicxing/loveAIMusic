/**
 * 微信登录API
 * GET: 获取微信登录授权URL
 * POST: 处理微信登录回调
 */

import { NextRequest, NextResponse } from 'next/server';
import { wechatService } from '@/lib/wechatService';
import { database } from '@/lib/database';
import jwt from 'jsonwebtoken';

// 生成微信登录授权URL
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state') || 'wechat_login';
    
    const authUrl = wechatService.generateAuthUrl(state);
    
    // 检查微信配置是否完整
    const isConfigured = !!(process.env.WECHAT_APP_ID && process.env.WECHAT_APP_SECRET);
    
    return NextResponse.json({
      success: true,
      data: {
        authUrl,
        state,
        appId: process.env.WECHAT_APP_ID,
        redirectUri: process.env.WECHAT_REDIRECT_URI,
        isConfigured
      },
      message: '获取微信登录URL成功'
    });
  } catch (error) {
    console.error('❌ [WeChat Auth] 获取授权URL失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取微信登录URL失败'
    }, { status: 500 });
  }
}

// 处理微信登录回调
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, state } = body;

    if (!code) {
      return NextResponse.json({
        success: false,
        error: '缺少授权码'
      }, { status: 400 });
    }

    console.log('🔐 [WeChat Auth] 处理微信登录回调:', { code: code.substring(0, 10) + '...', state });

    // 1. 获取access_token
    const tokenResult = await wechatService.getAccessToken(code);
    if ('errcode' in tokenResult) {
      console.error('❌ [WeChat Auth] 获取access_token失败:', tokenResult);
      return NextResponse.json({
        success: false,
        error: `微信登录失败: ${tokenResult.errmsg}`
      }, { status: 400 });
    }

    const { access_token, openid, unionid, refresh_token } = tokenResult;

    // 2. 获取用户信息
    const userInfoResult = await wechatService.getUserInfo(access_token, openid);
    if ('errcode' in userInfoResult) {
      console.error('❌ [WeChat Auth] 获取用户信息失败:', userInfoResult);
      return NextResponse.json({
        success: false,
        error: `获取用户信息失败: ${userInfoResult.errmsg}`
      }, { status: 400 });
    }

    const { nickname, headimgurl, sex, province, city, country } = userInfoResult;

    // 3. 查询或创建用户
    const connection = await database.getConnection();
    try {
      // 先查询是否已存在微信用户
      let [existingUsers] = await connection.execute(
        'SELECT * FROM users WHERE wechat_openid = ? OR (unionid IS NOT NULL AND unionid = ?)',
        [openid, unionid || '']
      ) as any[];

      let user;
      if (existingUsers.length > 0) {
        // 用户已存在，更新微信信息
        user = existingUsers[0];
        await connection.execute(
          'UPDATE users SET wechat_openid = ?, unionid = ?, wechat_nickname = ?, wechat_avatar = ?, updated_at = NOW() WHERE id = ?',
          [openid, unionid || null, nickname, headimgurl, user.id]
        );
        console.log('✅ [WeChat Auth] 更新现有用户微信信息:', user.id);
      } else {
        // 创建新用户
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await connection.execute(
          `INSERT INTO users (
            id, phone, email, password_hash, nickname, avatar_url, 
            wechat_openid, unionid, wechat_nickname, wechat_avatar,
            vip_level, credits, created_at, updated_at, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)`,
          [
            userId,
            null, // phone
            null, // email  
            null, // password_hash
            nickname, // nickname
            headimgurl, // avatar_url
            openid, // wechat_openid
            unionid || null, // unionid
            nickname, // wechat_nickname
            headimgurl, // wechat_avatar
            'free', // vip_level
            0, // credits
            'active' // status
          ]
        );
        
        // 获取创建的用户信息
        const [newUsers] = await connection.execute(
          'SELECT * FROM users WHERE id = ?',
          [userId]
        ) as any[];
        user = newUsers[0];
        console.log('✅ [WeChat Auth] 创建新用户:', user.id);
      }

      // 4. 生成JWT token
      const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_key';
      const token = jwt.sign(
        { 
          userId: user.id,
          openid: openid,
          loginType: 'wechat'
        },
        jwtSecret,
        { expiresIn: '7d' }
      );

      // 5. 保存用户会话
      await connection.execute(
        'INSERT INTO user_sessions (user_id, session_token, login_type, expires_at, created_at) VALUES (?, ?, ?, ?, NOW())',
        [user.id, token, 'wechat', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
      );

      // 6. 保存微信token信息（可选，用于后续API调用）
      await connection.execute(
        `INSERT INTO wechat_tokens (user_id, access_token, refresh_token, expires_at, created_at) 
         VALUES (?, ?, ?, ?, NOW()) 
         ON DUPLICATE KEY UPDATE 
         access_token = VALUES(access_token), 
         refresh_token = VALUES(refresh_token), 
         expires_at = VALUES(expires_at), 
         updated_at = NOW()`,
        [user.id, access_token, refresh_token, new Date(Date.now() + 7200 * 1000)]
      );

      return NextResponse.json({
        success: true,
        data: {
          user: {
            id: user.id,
            nickname: user.nickname,
            avatar: user.avatar_url,
            vipLevel: user.vip_level,
            credits: user.credits
          },
          token,
          loginType: 'wechat'
        },
        message: '微信登录成功'
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('❌ [WeChat Auth] 微信登录处理失败:', error);
    return NextResponse.json({
      success: false,
      error: '微信登录处理失败'
    }, { status: 500 });
  }
}
