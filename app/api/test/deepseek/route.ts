import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testType = 'connection' } = body;

    if (testType === 'connection') {
      // 直接测试DeepSeek API连接
      const API_KEY = process.env.OPENAI_API_KEY;
      const API_URL = process.env.OPENAI_API_URL;

      if (!API_KEY || !API_URL) {
        return NextResponse.json(
          { error: '环境变量未配置', details: ['OPENAI_API_KEY', 'OPENAI_API_URL'] },
          { status: 400 }
        );
      }

      const response = await fetch(`${API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'user',
              content: '你好，请简单介绍一下你自己。'
            }
          ],
          temperature: 0.7,
          max_tokens: 100
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return NextResponse.json(
          { error: 'API连接失败', details: `${response.status} ${errorData.error?.message || response.statusText}` },
          { status: 500 }
        );
      }

      const data = await response.json();
      
      return NextResponse.json({
        success: true,
        message: 'DeepSeek API连接正常',
        data: {
          response: data.choices[0].message.content,
          usage: data.usage
        }
      });
    }

    if (testType === 'lyrics') {
      // 测试歌词生成
      const { answers } = body;
      if (!answers) {
        return NextResponse.json(
          { error: '缺少测试数据' },
          { status: 400 }
        );
      }

      const API_KEY = process.env.OPENAI_API_KEY;
      const API_URL = process.env.OPENAI_API_URL;

      if (!API_KEY || !API_URL) {
        return NextResponse.json(
          { error: '环境变量未配置' },
          { status: 400 }
        );
      }

      // 生成基础歌词的提示词
      const prompt = `
你是一位专业的中文歌词创作AI，请根据以下用户信息创作一首基础歌词框架：

## 用户信息
- 称呼对象：${answers.recipientNickname || '未指定'}
- 关系：${answers.relationship || '未指定'}
- 相识年份：${answers.metYear || '未指定'}
- 重要节点：${answers.keyMoments?.join('、') || '无'}
- 回忆场景：${answers.memoryScenes?.join('、') || '无'}
- 核心主题：${answers.coreTheme || '未指定'}
- 专属暗号：${answers.privateCode || '无'}
- 歌曲基调：${answers.songTone || '未指定'}

## 创作要求
1. 创作一首中文情歌的基础歌词框架
2. 包含主歌和副歌的基本结构
3. 体现用户的核心主题和情感基调
4. 融入具体的回忆场景和细节
5. 语言要温柔细腻
6. 歌词要真挚感人，贴近用户的故事

## 输出格式
请直接输出歌词内容，不需要额外说明。歌词应该包含：
- 主歌部分（2-3段）
- 副歌部分（重复2次）
- 每段4-6行，每行8-12字

请开始创作：
`;

      const response = await fetch(`${API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return NextResponse.json(
          { error: '歌词生成失败', details: `${response.status} ${errorData.error?.message || response.statusText}` },
          { status: 500 }
        );
      }

      const data = await response.json();
      
      return NextResponse.json({
        success: true,
        data: {
          lyrics: data.choices[0].message.content,
          usage: data.usage
        }
      });
    }

    return NextResponse.json(
      { error: '无效的测试类型' },
      { status: 400 }
    );

  } catch (error) {
    console.error('DeepSeek测试API错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'DeepSeek API测试端点',
    usage: {
      'POST /api/test/deepseek': {
        description: '测试DeepSeek API连接和歌词生成',
        body: {
          testType: 'connection | lyrics',
          answers: '用户答案数据（仅lyrics测试需要）'
        }
      }
    }
  });
}
