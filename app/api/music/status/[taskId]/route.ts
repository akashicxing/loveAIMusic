import { NextRequest, NextResponse } from 'next/server';
import { sunoService } from '@/lib/sunoService';

export async function GET(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  console.log('🔍 [API] 收到音乐状态检查请求');
  
  try {
    const { taskId } = params;

    console.log('📝 [API] 任务ID:', taskId);

    if (!taskId) {
      console.error('❌ [API] 缺少任务ID');
      return NextResponse.json(
        { error: '缺少任务ID' },
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

    // 调用SunoAI检查状态
    const result = await sunoService.checkMusicStatus(taskId);

    console.log('📊 [API] SunoAI状态检查结果:', {
      success: result.success,
      status: result.data?.status,
      hasAudioUrl: !!result.data?.audio_url,
      error: result.error
    });

    if (!result.success) {
      console.error('❌ [API] SunoAI状态检查失败:', result.error);
      return NextResponse.json(
        { error: result.error || '状态检查失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        taskId: result.data?.id,
        status: result.data?.status,
        audioUrl: result.data?.audio_url,
        isCompleted: result.data?.status === 'completed' || result.data?.status === 'success',
        isProcessing: result.data?.status === 'processing' || result.data?.status === 'pending'
      }
    });

  } catch (error) {
    console.error('💥 [API] 音乐状态检查API错误:', error);
    console.error('💥 [API] 错误堆栈:', error instanceof Error ? error.stack : '无堆栈信息');
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
