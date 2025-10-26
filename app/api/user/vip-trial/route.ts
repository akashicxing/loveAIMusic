import { NextRequest, NextResponse } from 'next/server';
import { vipTrialService } from '@/lib/vipTrialService';

/**
 * 用户VIP试用码相关API
 */

export async function POST(request: NextRequest) {
  console.log('🎫 [User] 收到VIP试用码使用请求');
  
  try {
    const body = await request.json();
    const { code } = body;

    // TODO: 从JWT token中获取用户ID
    // 这里暂时使用模拟的用户ID，实际应该从认证中间件获取
    const userId = 'temp-user-id'; // 需要替换为实际的用户认证逻辑

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: '请输入有效的试用码' },
        { status: 400 }
      );
    }

    console.log(`📝 [User] 用户 ${userId} 尝试使用试用码: ${code}`);

    // 使用试用码
    const result = await vipTrialService.useTrialCode(code, userId);

    if (result.success && result.vipDays) {
      console.log(`✅ [User] 用户 ${userId} 成功使用试用码，获得 ${result.vipDays} 天VIP`);
      
      return NextResponse.json({
        success: true,
        message: `恭喜！您已成功激活 ${result.vipDays} 天VIP试用`,
        data: {
          vipDays: result.vipDays,
          expiresAt: new Date(Date.now() + result.vipDays * 24 * 60 * 60 * 1000).toISOString()
        }
      });
    } else {
      console.log(`❌ [User] 用户 ${userId} 使用试用码失败: ${result.error}`);
      
      return NextResponse.json(
        { error: result.error || '试用码使用失败' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('💥 [User] VIP试用码使用失败:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  console.log('📋 [User] 收到VIP状态查询请求');
  
  try {
    // TODO: 从JWT token中获取用户ID
    const userId = 'temp-user-id'; // 需要替换为实际的用户认证逻辑

    // 获取用户VIP状态
    const vipStatus = await vipTrialService.getUserVipStatus(userId);

    console.log(`📊 [User] 用户 ${userId} VIP状态:`, vipStatus);

    return NextResponse.json({
      success: true,
      data: vipStatus
    });

  } catch (error) {
    console.error('💥 [User] VIP状态查询失败:', error);
    return NextResponse.json(
      { error: '查询失败，请重试' },
      { status: 500 }
    );
  }
}
