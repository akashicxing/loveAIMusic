import { NextRequest, NextResponse } from 'next/server';
import { sunoService } from '@/lib/sunoService';

export async function POST(request: NextRequest) {
  console.log('🎵 [API] 收到音乐生成请求');
  
  try {
    const body = await request.json();
    const { lyrics, title, musicStyle, stylePrompt } = body;

    console.log('📝 [API] 请求体:', {
      lyricsLength: lyrics?.length || 0,
      title: title,
      musicStyle: musicStyle,
      hasStylePrompt: !!stylePrompt
    });

    // 验证必要参数
    if (!lyrics || !title || !musicStyle) {
      console.error('❌ [API] 缺少必要参数');
      return NextResponse.json(
        { error: '缺少必要参数：歌词、歌名或音乐风格' },
        { status: 400 }
      );
    }

    // 检查API密钥
    if (!process.env.YUNWU_API_KEY) {
      console.error('❌ [API] SunoAI API密钥未配置');
      return NextResponse.json(
        { error: 'SunoAI API密钥未配置' },
        { status: 500 }
      );
    }

    console.log('⚠️ [API] 警告：SunoAI音乐生成费用很高，正在调用...');

    // 调用SunoAI生成音乐
    const result = await sunoService.generateMusic(lyrics, title, musicStyle, stylePrompt);

    console.log('📊 [API] SunoAI返回结果:', {
      success: result.success,
      hasData: !!result.data,
      error: result.error
    });

    if (!result.success) {
      console.error('❌ [API] SunoAI调用失败:', result.error);
      return NextResponse.json(
        { error: result.error || '音乐生成失败' },
        { status: 500 }
      );
    }

    console.log('✅ [API] 音乐生成任务已提交，任务ID:', result.data?.id);

    return NextResponse.json({
      success: true,
      data: {
        taskId: result.data?.id,
        status: result.data?.status,
        message: '音乐生成任务已提交，请稍后查询状态'
      }
    });

  } catch (error) {
    console.error('💥 [API] 音乐生成API错误:', error);
    console.error('💥 [API] 错误堆栈:', error instanceof Error ? error.stack : '无堆栈信息');
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
