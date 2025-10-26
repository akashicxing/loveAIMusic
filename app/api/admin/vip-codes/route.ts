import { NextRequest, NextResponse } from 'next/server';
import { vipTrialService } from '@/lib/vipTrialService';
import { database } from '@/lib/database';

/**
 * VIP试用码管理API
 * 注意：此接口不对外开放，只有程序内部调用
 */

export async function POST(request: NextRequest) {
  console.log('🎫 [Admin] 收到VIP试用码生成请求');
  
  try {
    const body = await request.json();
    const { count = 1, vipDays = 7 } = body;

    // 简单的内部验证（生产环境应该使用更严格的验证）
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.ADMIN_SECRET_KEY || 'admin123'}`) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    if (count < 1 || count > 100) {
      return NextResponse.json(
        { error: '生成数量必须在1-100之间' },
        { status: 400 }
      );
    }

    if (vipDays < 1 || vipDays > 365) {
      return NextResponse.json(
        { error: 'VIP天数必须在1-365之间' },
        { status: 400 }
      );
    }

    console.log(`📝 [Admin] 生成参数: count=${count}, vipDays=${vipDays}`);

    // 生成试用码
    const codes = await vipTrialService.generateTrialCodes(count, vipDays);

    console.log(`✅ [Admin] 成功生成 ${codes.length} 个VIP试用码`);

    return NextResponse.json({
      success: true,
      message: `成功生成 ${codes.length} 个VIP试用码`,
      data: {
        codes,
        count: codes.length,
        vipDays
      }
    });

  } catch (error) {
    console.error('💥 [Admin] VIP试用码生成失败:', error);
    return NextResponse.json(
      { error: '生成失败，请重试' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  console.log('📋 [Admin] 收到VIP试用码查询请求');
  
  try {
    // 简单的内部验证
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.ADMIN_SECRET_KEY || 'admin123'}`) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';
    const limit = parseInt(searchParams.get('limit') || '50');

    // 查询试用码列表
    const codes = await database.query(
      `SELECT id, code, vip_days, used_by, used_at, expires_at, created_at, status
       FROM vip_trial_codes 
       WHERE status = ? 
       ORDER BY created_at DESC 
       LIMIT ?`,
      [status, limit]
    );

    // 统计信息
    const stats = await database.queryOne(
      `SELECT 
         COUNT(*) as total,
         SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
         SUM(CASE WHEN status = 'used' THEN 1 ELSE 0 END) as used,
         SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END) as expired
       FROM vip_trial_codes`
    );

    console.log(`📊 [Admin] 查询到 ${codes.length} 个试用码`);

    return NextResponse.json({
      success: true,
      data: {
        codes,
        stats
      }
    });

  } catch (error) {
    console.error('💥 [Admin] VIP试用码查询失败:', error);
    return NextResponse.json(
      { error: '查询失败，请重试' },
      { status: 500 }
    );
  }
}
