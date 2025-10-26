/**
 * 微信平台证书验证API
 * 用于验证微信回调的签名和证书
 */

import { NextRequest, NextResponse } from 'next/server';
import { wechatSecurityService } from '@/lib/wechatSecurityService';

// 验证微信回调签名
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, signature, timestamp, nonce } = body;

    if (!data || !signature || !timestamp || !nonce) {
      return NextResponse.json({
        success: false,
        error: '缺少必要参数'
      }, { status: 400 });
    }

    console.log('🔐 [WeChat Verify] 验证微信回调签名');

    // 验证签名
    const isValid = wechatSecurityService.verifyPlatformSignature(
      data,
      signature,
      timestamp,
      nonce
    );

    if (isValid) {
      console.log('✅ [WeChat Verify] 签名验证成功');
      return NextResponse.json({
        success: true,
        message: '签名验证成功'
      });
    } else {
      console.log('❌ [WeChat Verify] 签名验证失败');
      return NextResponse.json({
        success: false,
        error: '签名验证失败'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ [WeChat Verify] 验证异常:', error);
    return NextResponse.json({
      success: false,
      error: '验证处理失败'
    }, { status: 500 });
  }
}

// 获取安全配置状态
export async function GET(request: NextRequest) {
  try {
    const securityStatus = wechatSecurityService.getSecurityStatus();
    
    return NextResponse.json({
      success: true,
      data: securityStatus,
      message: '安全配置状态获取成功'
    });
  } catch (error) {
    console.error('❌ [WeChat Verify] 获取安全状态失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取安全状态失败'
    }, { status: 500 });
  }
}
