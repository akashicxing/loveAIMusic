import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/aiService';
import { validateUserAnswers } from '@/lib/promptTemplates';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { answers, basicLyrics } = body;

    if (!answers || !basicLyrics) {
      return NextResponse.json(
        { error: '缺少用户答案数据或基础歌词' },
        { status: 400 }
      );
    }

    // 验证第二轮答案
    const validationErrors = validateUserAnswers(answers, 2);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: '答案验证失败', details: validationErrors },
        { status: 400 }
      );
    }

    // 生成完整歌词和歌名
    const result = await aiService.generateCompleteLyrics(answers, basicLyrics);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || '生成完整歌词失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      usage: result.usage
    });

  } catch (error) {
    console.error('生成完整歌词API错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
