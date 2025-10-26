/**
 * 微信PC OpenSDK Ticket API
 * 用于获取PC端微信能力的ticket
 */

import { NextRequest, NextResponse } from 'next/server';
import { wechatService } from '@/lib/wechatService';
import { database } from '@/lib/database';
import jwt from 'jsonwebtoken';

// 获取PC OpenSDK ticket
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken } = body;

    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: '缺少access_token'
      }, { status: 400 });
    }

    console.log('🎫 [WeChat Ticket] 获取PC OpenSDK ticket');

    // 获取ticket
    const ticketResult = await wechatService.getPCOpenSDKTicket(accessToken);
    
    if ('errcode' in ticketResult) {
      console.error('❌ [WeChat Ticket] 获取ticket失败:', ticketResult);
      return NextResponse.json({
        success: false,
        error: `获取ticket失败: ${ticketResult.errmsg}`
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ticket: ticketResult.ticket,
        expiresIn: ticketResult.expires_in
      },
      message: '获取ticket成功'
    });

  } catch (error) {
    console.error('❌ [WeChat Ticket] 获取ticket异常:', error);
    return NextResponse.json({
      success: false,
      error: '获取ticket失败'
    }, { status: 500 });
  }
}

// 通过用户ID获取ticket（需要用户已登录）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: '缺少用户ID'
      }, { status: 400 });
    }

    // 验证JWT token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: '未授权访问'
      }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_key';
    
    try {
      const decoded = jwt.verify(token, jwtSecret) as any;
      if (decoded.userId !== userId) {
        return NextResponse.json({
          success: false,
          error: '用户ID不匹配'
        }, { status: 403 });
      }
    } catch (jwtError) {
      return NextResponse.json({
        success: false,
        error: 'Token无效'
      }, { status: 401 });
    }

    // 获取用户的微信token
    const connection = await database.getConnection();
    try {
      const [tokens] = await connection.execute(
        'SELECT access_token, refresh_token, expires_at FROM wechat_tokens WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
        [userId]
      ) as any[];

      if (tokens.length === 0) {
        return NextResponse.json({
          success: false,
          error: '用户未绑定微信'
        }, { status: 404 });
      }

      const { access_token, refresh_token, expires_at } = tokens[0];
      
      // 检查token是否过期
      if (new Date() > new Date(expires_at)) {
        // token过期，尝试刷新
        console.log('🔄 [WeChat Ticket] Token过期，尝试刷新');
        const refreshResult = await wechatService.refreshAccessToken(refresh_token);
        
        if ('errcode' in refreshResult) {
          return NextResponse.json({
            success: false,
            error: '微信token已过期且刷新失败'
          }, { status: 400 });
        }

        // 更新数据库中的token
        await connection.execute(
          'UPDATE wechat_tokens SET access_token = ?, refresh_token = ?, expires_at = ?, updated_at = NOW() WHERE user_id = ?',
          [refreshResult.access_token, refreshResult.refresh_token, new Date(Date.now() + refreshResult.expires_in * 1000), userId]
        );

        // 使用新的access_token获取ticket
        const ticketResult = await wechatService.getPCOpenSDKTicket(refreshResult.access_token);
        
        if ('errcode' in ticketResult) {
          return NextResponse.json({
            success: false,
            error: `获取ticket失败: ${ticketResult.errmsg}`
          }, { status: 400 });
        }

        return NextResponse.json({
          success: true,
          data: {
            ticket: ticketResult.ticket,
            expiresIn: ticketResult.expires_in
          },
          message: '获取ticket成功'
        });
      }

      // token未过期，直接获取ticket
      const ticketResult = await wechatService.getPCOpenSDKTicket(access_token);
      
      if ('errcode' in ticketResult) {
        return NextResponse.json({
          success: false,
          error: `获取ticket失败: ${ticketResult.errmsg}`
        }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        data: {
          ticket: ticketResult.ticket,
          expiresIn: ticketResult.expires_in
        },
        message: '获取ticket成功'
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('❌ [WeChat Ticket] 获取ticket异常:', error);
    return NextResponse.json({
      success: false,
      error: '获取ticket失败'
    }, { status: 500 });
  }
}
