import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/aiService';
import { validateUserAnswers } from '@/lib/promptTemplates';

export async function POST(request: NextRequest) {
  console.log('🎵 [API] 收到生成歌名和结构的请求');
  
  try {
    const body = await request.json();
    const { answers } = body;

    console.log('📝 [API] 请求体:', JSON.stringify(body, null, 2));

    if (!answers) {
      console.error('❌ [API] 缺少用户答案数据');
      return NextResponse.json(
        { error: '缺少用户答案数据' },
        { status: 400 }
      );
    }

    // 验证第一轮答案
    console.log('🔍 [API] 开始验证第一轮答案');
    const validationErrors = validateUserAnswers(answers, 1);
    if (validationErrors.length > 0) {
      console.error('❌ [API] 答案验证失败:', validationErrors);
      return NextResponse.json(
        { error: '答案验证失败', details: validationErrors },
        { status: 400 }
      );
    }
    console.log('✅ [API] 答案验证通过');

    // 生成歌名备选和结构设计
    console.log('🤖 [API] 开始调用AI服务生成歌名和结构');
    const result = await aiService.generateSongStructure(answers);

    console.log('📊 [API] AI服务返回结果:', {
      success: result.success,
      hasData: !!result.data,
      error: result.error
    });

    if (!result.success) {
      console.error('❌ [API] AI服务调用失败:', result.error);
      return NextResponse.json(
        { error: result.error || '生成歌名和结构失败' },
        { status: 500 }
      );
    }

    console.log('✅ [API] 成功生成歌名和结构，返回结果');
    return NextResponse.json({
      success: true,
      data: result.data,
      usage: result.usage
    });

  } catch (error) {
    console.error('💥 [API] 生成歌名和结构API错误:', error);
    console.error('💥 [API] 错误堆栈:', error instanceof Error ? error.stack : '无堆栈信息');
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
