import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/aiService';
import { storageService } from '@/lib/storageService';
import { databaseService } from '@/lib/databaseService';
import { validateUserAnswers } from '@/lib/promptTemplates';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId, 
      round1Answers, 
      round2Answers, 
      musicStyleId,
      vocalType 
    } = body;

    if (!userId || !round1Answers || !round2Answers || !musicStyleId) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 验证答案完整性
    const round1Errors = validateUserAnswers(round1Answers, 1);
    const round2Errors = validateUserAnswers(round2Answers, 2);
    
    if (round1Errors.length > 0 || round2Errors.length > 0) {
      return NextResponse.json(
        { 
          error: '答案验证失败', 
          details: {
            round1: round1Errors,
            round2: round2Errors
          }
        },
        { status: 400 }
      );
    }

    // 获取音乐风格信息
    const musicStylesResponse = await fetch(`${request.nextUrl.origin}/api/music-styles`);
    const musicStylesData = await musicStylesResponse.json();
    const musicStyle = musicStylesData.styles.find((style: any) => style.id === musicStyleId);

    if (!musicStyle) {
      return NextResponse.json(
        { error: '未找到指定的音乐风格' },
        { status: 400 }
      );
    }

    // 创建作品记录
    const work = await databaseService.createUserWork({
      userId,
      title: '生成中...',
      styleId: musicStyleId,
      status: 'generating',
      generationProgress: 0,
      generationStage: '开始生成基础歌词'
    });

    if (!work) {
      return NextResponse.json(
        { error: '创建作品记录失败' },
        { status: 500 }
      );
    }

    // 保存用户答案
    const answers = [
      ...Object.entries(round1Answers).map(([questionId, answerValue]) => ({
        id: '',
        userId,
        workId: work.id,
        roundNumber: 1,
        questionId,
        answerValue: String(answerValue),
        answerType: 'text',
        createdAt: new Date()
      })),
      ...Object.entries(round2Answers).map(([questionId, answerValue]) => ({
        id: '',
        userId,
        workId: work.id,
        roundNumber: 2,
        questionId,
        answerValue: String(answerValue),
        answerType: 'text',
        createdAt: new Date()
      }))
    ];

    await databaseService.saveUserAnswers(answers);

    // 异步执行生成流程
    generateWorkAsync(work.id, round1Answers, round2Answers, musicStyle, vocalType);

    return NextResponse.json({
      success: true,
      data: {
        workId: work.id,
        status: 'generating',
        message: '开始生成作品，请稍候...'
      }
    });

  } catch (error) {
    console.error('生成作品API错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

/**
 * 异步生成作品流程
 */
async function generateWorkAsync(
  workId: string,
  round1Answers: any,
  round2Answers: any,
  musicStyle: any,
  vocalType?: string
) {
  try {
    // 第一步：生成基础歌词
    await databaseService.updateUserWorkStatus(
      workId,
      'generating',
      10,
      '生成基础歌词中...'
    );

    const basicLyricsResult = await aiService.generateSongStructure(round1Answers);
    
    if (!basicLyricsResult.success) {
      await databaseService.updateUserWorkStatus(
        workId,
        'failed',
        0,
        '生成基础歌词失败',
        basicLyricsResult.error
      );
      return;
    }

    // 第二步：生成完整歌词和歌名
    await databaseService.updateUserWorkStatus(
      workId,
      'generating',
      30,
      '生成完整歌词中...'
    );

    const completeLyricsResult = await aiService.generateCompleteLyrics(
      round2Answers,
      basicLyricsResult.data!.lyrics
    );

    if (!completeLyricsResult.success) {
      await databaseService.updateUserWorkStatus(
        workId,
        'failed',
        0,
        '生成完整歌词失败',
        completeLyricsResult.error
      );
      return;
    }

    const { lyrics, title } = completeLyricsResult.data!;

    // 第三步：上传歌词到云存储
    await databaseService.updateUserWorkStatus(
      workId,
      'generating',
      50,
      '上传歌词文件中...'
    );

    const lyricsUploadResult = await storageService.uploadLyrics(lyrics, title, workId);
    
    if (!lyricsUploadResult.success) {
      await databaseService.updateUserWorkStatus(
        workId,
        'failed',
        0,
        '上传歌词失败',
        lyricsUploadResult.error
      );
      return;
    }

    // 第四步：生成音乐音频
    await databaseService.updateUserWorkStatus(
      workId,
      'generating',
      70,
      '生成音乐音频中...'
    );

    const musicResult = await aiService.generateMusic(lyrics, title, musicStyle, vocalType);

    if (!musicResult.success) {
      await databaseService.updateUserWorkStatus(
        workId,
        'failed',
        0,
        '生成音乐失败',
        musicResult.error
      );
      return;
    }

    // 第五步：上传音频到云存储
    await databaseService.updateUserWorkStatus(
      workId,
      'generating',
      90,
      '上传音频文件中...'
    );

    // 这里需要从AI服务获取音频Buffer，然后上传
    // 暂时使用AI返回的URL
    const audioUrl = musicResult.data!.audioUrl;

    // 第六步：完成生成
    await databaseService.updateUserWorkStatus(
      workId,
      'completed',
      100,
      '生成完成',
      undefined,
      audioUrl,
      lyricsUploadResult.url,
      musicResult.data!.duration,
      musicResult.data!.fileSize
    );

    // 更新作品标题
    await databaseService.updateUserWorkStatus(workId, 'completed', 100, '生成完成');

  } catch (error) {
    console.error('异步生成作品失败:', error);
    await databaseService.updateUserWorkStatus(
      workId,
      'failed',
      0,
      '生成过程中发生错误',
      error instanceof Error ? error.message : '未知错误'
    );
  }
}
