import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/aiService';
import { validateUserAnswers } from '@/lib/promptTemplates';

export async function POST(request: NextRequest) {
  console.log('🎵 [API] 收到生成完整歌词的请求');
  
  try {
    const body = await request.json();
    const { round1Answers, round2Answers, selectedTitle, selectedVersion, songStructure } = body;

    console.log('📝 [API] 请求体:', JSON.stringify(body, null, 2));

    if (!round1Answers || !round2Answers) {
      console.error('❌ [API] 缺少必要数据');
      return NextResponse.json(
        { error: '缺少用户答案数据' },
        { status: 400 }
      );
    }

    // 验证数据完整性
    console.log('🔍 [API] 开始验证数据完整性');
    if (!selectedTitle || !selectedVersion) {
      console.error('❌ [API] 缺少歌名或版本选择');
      return NextResponse.json(
        { error: '请先选择歌名和版本' },
        { status: 400 }
      );
    }
    console.log('✅ [API] 数据验证通过');

    // 生成完整歌词和歌名
    console.log('🤖 [API] 开始调用AI服务生成完整歌词');
    const result = await aiService.generateCompleteLyrics(round2Answers, round1Answers, selectedTitle, selectedVersion, songStructure);

    console.log('📊 [API] AI服务返回结果:', {
      success: result.success,
      hasData: !!result.data,
      error: result.error
    });

    if (!result.success) {
      console.error('❌ [API] AI服务调用失败:', result.error);
      return NextResponse.json(
        { error: result.error || '生成完整歌词失败' },
        { status: 500 }
      );
    }

    console.log('✅ [API] 成功生成完整歌词，返回结果');
    return NextResponse.json({
      success: true,
      data: result.data,
      usage: result.usage
    });

  } catch (error) {
    console.error('💥 [API] 生成完整歌词API错误:', error);
    console.error('💥 [API] 错误堆栈:', error instanceof Error ? error.stack : '无堆栈信息');
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
