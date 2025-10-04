import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/aiService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lyrics, songTitle, musicStyle, vocalType } = body;

    if (!lyrics || !songTitle || !musicStyle) {
      return NextResponse.json(
        { error: '缺少歌词、歌名或音乐风格数据' },
        { status: 400 }
      );
    }

    // 生成音乐音频
    const result = await aiService.generateMusic(lyrics, songTitle, musicStyle, vocalType);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || '生成音乐失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      usage: result.usage
    });

  } catch (error) {
    console.error('生成音乐API错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
