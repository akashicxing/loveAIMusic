/**
 * 数据库连接测试API
 * 用于测试数据库连接是否正常
 */

import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [Database Test] 开始测试数据库连接');

    // 测试数据库连接
    const connection = await database.getConnection();
    
    try {
      // 执行简单查询测试连接
      const [result] = await connection.execute('SELECT 1 as test') as any[];
      
      if (result && result.length > 0) {
        console.log('✅ [Database Test] 数据库连接成功');
        
        // 检查微信相关表是否存在
        const [tables] = await connection.execute(
          "SHOW TABLES LIKE 'users'"
        ) as any[];
        
        const [wechatTokensTable] = await connection.execute(
          "SHOW TABLES LIKE 'wechat_tokens'"
        ) as any[];

        return NextResponse.json({
          success: true,
          data: {
            connection: 'success',
            usersTable: tables.length > 0,
            wechatTokensTable: wechatTokensTable.length > 0,
            message: '数据库连接正常'
          },
          message: '数据库测试成功'
        });
      } else {
        throw new Error('数据库查询失败');
      }
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('❌ [Database Test] 数据库连接失败:', error);
    return NextResponse.json({
      success: false,
      error: '数据库连接失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}
