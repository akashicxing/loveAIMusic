import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '@/lib/databaseService';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: '缺少作品ID' },
        { status: 400 }
      );
    }

    const work = await databaseService.getUserWorkById(id);

    if (!work) {
      return NextResponse.json(
        { error: '未找到作品' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: work.id,
        status: work.status,
        progress: work.generationProgress,
        stage: work.generationStage,
        error: work.errorMessage,
        audioUrl: work.audioUrl,
        lyricsUrl: work.lyricsUrl,
        title: work.title,
        createdAt: work.createdAt,
        completedAt: work.completedAt
      }
    });

  } catch (error) {
    console.error('获取作品状态API错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
