/**
 * AI服务接口
 * 处理与云雾API的交互，包括歌词生成和音乐生成
 */

import { UserAnswers, MusicStyle } from './promptTemplates';

export interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface LyricsResponse {
  lyrics: string;
  title?: string;
  metadata?: {
    style: string;
    mood: string;
    length: number;
  };
}

export interface MusicResponse {
  audioUrl: string;
  duration: number;
  fileSize: number;
  metadata?: {
    style: string;
    quality: string;
    format: string;
  };
}

export interface GenerationStatus {
  id: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  progress: number;
  stage: string;
  result?: any;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

class AIService {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.baseUrl = process.env.OPENAI_API_URL || 'https://api.yunwu.com/v1';
    this.timeout = 30000; // 30秒超时
  }

  /**
   * 生成基础歌词
   */
  async generateBasicLyrics(answers: UserAnswers): Promise<AIResponse<LyricsResponse>> {
    try {
      const { generateBasicLyricsPrompt } = await import('./promptTemplates');
      const prompt = generateBasicLyricsPrompt(answers);

      const response = await this.callOpenAI(prompt, {
        max_tokens: 1000,
        temperature: 0.8,
        model: 'deepseek-chat'
      });

      if (!response.success) {
        return response;
      }

      // 解析AI返回的歌词
      const lyrics = this.parseLyrics(response.data.choices[0].message.content);
      
      return {
        success: true,
        data: {
          lyrics: lyrics.content,
          metadata: {
            style: answers.songTone || 'gentle',
            mood: answers.coreTheme || 'love',
            length: lyrics.content.length
          }
        },
        usage: response.usage
      };
    } catch (error) {
      console.error('生成基础歌词失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '生成基础歌词失败'
      };
    }
  }

  /**
   * 生成完整歌词和歌名
   */
  async generateCompleteLyrics(
    answers: UserAnswers, 
    basicLyrics: string
  ): Promise<AIResponse<LyricsResponse>> {
    try {
      const { generateCompleteLyricsPrompt } = await import('./promptTemplates');
      const prompt = generateCompleteLyricsPrompt(answers, basicLyrics);

      const response = await this.callOpenAI(prompt, {
        max_tokens: 1500,
        temperature: 0.7,
        model: 'deepseek-chat'
      });

      if (!response.success) {
        return response;
      }

      // 解析AI返回的完整歌词和歌名
      const result = this.parseCompleteLyrics(response.data.choices[0].message.content);
      
      return {
        success: true,
        data: {
          lyrics: result.lyrics,
          title: result.title,
          metadata: {
            style: answers.songTone || 'gentle',
            mood: answers.coreTheme || 'love',
            length: result.lyrics.length
          }
        },
        usage: response.usage
      };
    } catch (error) {
      console.error('生成完整歌词失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '生成完整歌词失败'
      };
    }
  }

  /**
   * 生成音乐音频
   */
  async generateMusic(
    lyrics: string,
    songTitle: string,
    musicStyle: MusicStyle,
    vocalType?: string
  ): Promise<AIResponse<MusicResponse>> {
    try {
      const { generateSunoPrompt, getRecommendedVocalType } = await import('./promptTemplates');
      const finalVocalType = vocalType || getRecommendedVocalType({} as UserAnswers);
      const prompt = generateSunoPrompt(lyrics, songTitle, musicStyle, finalVocalType);

      // 调用SunoAI生成音乐
      const response = await this.callSunoAI(prompt, {
        style: musicStyle.id,
        vocal_type: finalVocalType,
        duration: 180, // 3分钟
        quality: 'high'
      });

      if (!response.success) {
        return response;
      }

      return {
        success: true,
        data: {
          audioUrl: response.data.audio_url,
          duration: response.data.duration || 180,
          fileSize: response.data.file_size || 0,
          metadata: {
            style: musicStyle.id,
            quality: 'high',
            format: 'mp3'
          }
        },
        usage: response.usage
      };
    } catch (error) {
      console.error('生成音乐失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '生成音乐失败'
      };
    }
  }

  /**
   * 调用OpenAI兼容API
   */
  private async callOpenAI(prompt: string, options: any = {}): Promise<AIResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: options.model || 'deepseek-chat',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: options.max_tokens || 1000,
          temperature: options.temperature || 0.7,
          stream: false
        }),
        signal: AbortSignal.timeout(this.timeout)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API请求失败: ${response.status} ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data,
        usage: data.usage
      };
    } catch (error) {
      console.error('OpenAI API调用失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'API调用失败'
      };
    }
  }

  /**
   * 调用SunoAI生成音乐
   */
  private async callSunoAI(prompt: string, options: any = {}): Promise<AIResponse> {
    try {
      // 这里需要根据实际的SunoAI API进行调整
      const response = await fetch(`${this.baseUrl}/music/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          style: options.style,
          vocal_type: options.vocal_type,
          duration: options.duration,
          quality: options.quality
        }),
        signal: AbortSignal.timeout(60000) // 音乐生成需要更长时间
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`SunoAI请求失败: ${response.status} ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data,
        usage: data.usage
      };
    } catch (error) {
      console.error('SunoAI调用失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'SunoAI调用失败'
      };
    }
  }

  /**
   * 解析基础歌词
   */
  private parseLyrics(content: string): { content: string } {
    // 移除可能的格式标记，提取纯歌词内容
    const cleanContent = content
      .replace(/```[\s\S]*?```/g, '') // 移除代码块
      .replace(/\*\*.*?\*\*/g, '') // 移除粗体标记
      .replace(/#{1,6}\s*/g, '') // 移除标题标记
      .trim();

    return { content: cleanContent };
  }

  /**
   * 解析完整歌词和歌名
   */
  private parseCompleteLyrics(content: string): { lyrics: string; title: string } {
    const lines = content.split('\n');
    let title = '';
    let lyrics = '';
    let inLyrics = false;

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('**歌名：**') || trimmedLine.startsWith('歌名：')) {
        title = trimmedLine.replace(/^\*\*歌名：\*\*\s*/, '').replace(/^歌名：\s*/, '').trim();
      } else if (trimmedLine.startsWith('**完整歌词：**') || trimmedLine.startsWith('完整歌词：')) {
        inLyrics = true;
        continue;
      } else if (inLyrics && trimmedLine) {
        lyrics += trimmedLine + '\n';
      }
    }

    return {
      title: title || '未命名歌曲',
      lyrics: lyrics.trim()
    };
  }

  /**
   * 验证API配置
   */
  validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.apiKey) {
      errors.push('API密钥未配置');
    }

    if (!this.baseUrl) {
      errors.push('API地址未配置');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// 导出单例实例
export const aiService = new AIService();

// 导出类型
export type { AIResponse, LyricsResponse, MusicResponse, GenerationStatus };
