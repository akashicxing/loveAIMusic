/**
 * SunoAI音乐生成服务
 * 注意：此服务费用很高，请谨慎使用
 */

interface SunoMusicRequest {
  prompt: string;           // 歌词内容
  mv: string;              // 模型版本，默认chirp-v4
  title: string;           // 歌名
  tags: string;            // 音乐风格标签
  continue_at?: number;    // 继续时间点
  continue_clip_id?: string; // 继续的片段ID
  task?: string;           // 任务ID
}

interface SunoMusicResponse {
  success: boolean;
  data?: {
    id: string;
    status: string;
    audio_url?: string;
    task_id?: string;
  };
  error?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class SunoService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.YUNWU_API_KEY || '';
    this.baseUrl = process.env.YUNWU_API_BASE_URL || 'https://yunwu.ai';
    
    if (!this.apiKey) {
      console.warn('⚠️ [SunoAI] API密钥未配置，音乐生成功能将不可用');
    }
  }

  /**
   * 生成音乐
   * 注意：此功能费用很高，请谨慎使用
   */
  async generateMusic(
    lyrics: string,
    title: string,
    musicStyle: string,
    stylePrompt?: string
  ): Promise<SunoMusicResponse> {
    console.log('🎵 [SunoAI] 开始生成音乐');
    console.log('📝 [SunoAI] 歌词长度:', lyrics.length);
    console.log('📝 [SunoAI] 歌名:', title);
    console.log('📝 [SunoAI] 音乐风格:', musicStyle);
    console.log('📝 [SunoAI] 风格提示词:', stylePrompt);

    if (!this.apiKey) {
      return {
        success: false,
        error: 'SunoAI API密钥未配置'
      };
    }

    try {
      const requestData: SunoMusicRequest = {
        prompt: lyrics,
        mv: 'chirp-v4',  // 默认使用chirp-v4
        title: title,
        tags: musicStyle,
        // 如果有风格提示词，可以作为额外的描述
        ...(stylePrompt && { gpt_description_prompt: stylePrompt })
      };

      console.log('🤖 [SunoAI] 请求数据:', {
        prompt: requestData.prompt.substring(0, 100) + '...',
        mv: requestData.mv,
        title: requestData.title,
        tags: requestData.tags
      });

      const response = await fetch(`${this.baseUrl}/suno/submit/music`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestData)
      });

      console.log('📡 [SunoAI] 响应状态:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [SunoAI] API请求失败:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText
        });
        return {
          success: false,
          error: `SunoAI API请求失败: ${response.status} ${errorText}`
        };
      }

      const result = await response.json();
      console.log('📊 [SunoAI] API返回结果:', {
        success: true,
        hasData: !!result,
        taskId: result.id || result.task_id
      });

      return {
        success: true,
        data: {
          id: result.id || result.task_id || '',
          status: result.status || 'processing',
          audio_url: result.audio_url,
          task_id: result.task_id || result.id
        }
      };

    } catch (error) {
      console.error('💥 [SunoAI] 生成音乐失败:', error);
      console.error('💥 [SunoAI] 错误堆栈:', error instanceof Error ? error.stack : '无堆栈信息');
      return {
        success: false,
        error: error instanceof Error ? error.message : '生成音乐失败'
      };
    }
  }

  /**
   * 检查音乐生成状态
   */
  async checkMusicStatus(taskId: string): Promise<SunoMusicResponse> {
    console.log('🔍 [SunoAI] 检查音乐生成状态:', taskId);

    if (!this.apiKey) {
      return {
        success: false,
        error: 'SunoAI API密钥未配置'
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/suno/status/${taskId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      console.log('📡 [SunoAI] 状态检查响应:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [SunoAI] 状态检查失败:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText
        });
        return {
          success: false,
          error: `状态检查失败: ${response.status} ${errorText}`
        };
      }

      const result = await response.json();
      console.log('📊 [SunoAI] 状态检查结果:', {
        status: result.status,
        hasAudioUrl: !!result.audio_url
      });

      return {
        success: true,
        data: {
          id: taskId,
          status: result.status || 'unknown',
          audio_url: result.audio_url,
          task_id: taskId
        }
      };

    } catch (error) {
      console.error('💥 [SunoAI] 状态检查失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '状态检查失败'
      };
    }
  }
}

// 创建单例实例
export const sunoService = new SunoService();
