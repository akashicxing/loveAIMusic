import { NextRequest, NextResponse } from 'next/server';

// 这里可以集成Redis或其他缓存系统来存储生成状态
// 目前使用内存存储作为示例
const generationStatus = new Map<string, any>();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: '缺少生成ID' },
        { status: 400 }
      );
    }

    const status = generationStatus.get(id);
    if (!status) {
      return NextResponse.json(
        { error: '未找到生成状态' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: status
    });

  } catch (error) {
    console.error('获取生成状态API错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, progress, stage, result, error } = body;

    if (!id) {
      return NextResponse.json(
        { error: '缺少生成ID' },
        { status: 400 }
      );
    }

    const currentStatus = generationStatus.get(id) || {
      id,
      status: 'pending',
      progress: 0,
      stage: '初始化',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // 更新状态
    const updatedStatus = {
      ...currentStatus,
      status: status || currentStatus.status,
      progress: progress !== undefined ? progress : currentStatus.progress,
      stage: stage || currentStatus.stage,
      result: result || currentStatus.result,
      error: error || currentStatus.error,
      updatedAt: new Date()
    };

    generationStatus.set(id, updatedStatus);

    return NextResponse.json({
      success: true,
      data: updatedStatus
    });

  } catch (error) {
    console.error('更新生成状态API错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
