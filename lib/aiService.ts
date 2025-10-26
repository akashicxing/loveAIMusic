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
    this.apiKey = process.env.DEEPSEEK_API_KEY || '';
    this.baseUrl = 'https://api.deepseek.com';
    this.timeout = 120000; // 120秒超时，DeepSeek可能需要更长时间
  }

  /**
   * 生成歌名备选和结构设计
   */
  async generateSongStructure(answers: UserAnswers): Promise<AIResponse> {
    console.log('🎵 [AI Service] 开始生成歌名备选和结构设计');
    console.log('📝 [AI Service] 用户答案:', JSON.stringify(answers, null, 2));
    
    try {
      const { generateSongStructurePrompt } = await import('./promptTemplates');
      const prompt = generateSongStructurePrompt(answers);
      
      console.log('🤖 [AI Service] 生成的提示词:', prompt.substring(0, 200) + '...');
      console.log('🔑 [AI Service] API配置:', {
        baseUrl: this.baseUrl,
        hasApiKey: !!this.apiKey,
        apiKeyPrefix: this.apiKey.substring(0, 10) + '...'
      });

      const response = await this.callOpenAI(prompt, {
        max_tokens: 1500,
        temperature: 0.7,
        model: 'deepseek-chat'
      });

      console.log('📡 [AI Service] API响应状态:', response.success ? '成功' : '失败');
      
      if (!response.success) {
        console.error('❌ [AI Service] API调用失败:', response.error);
        return response;
      }

      console.log('📄 [AI Service] AI原始响应:', response.data.choices[0].message.content);

      // 解析AI返回的结构设计
      const structure = this.parseSongStructure(response.data.choices[0].message.content);
      
      console.log('✅ [AI Service] 解析后的结构数据:', JSON.stringify(structure, null, 2));
      
      return {
        success: true,
        data: structure,
        usage: response.usage
      };
    } catch (error) {
      console.error('💥 [AI Service] 生成歌名和结构失败:', error);
      console.error('💥 [AI Service] 错误堆栈:', error instanceof Error ? error.stack : '无堆栈信息');
      return {
        success: false,
        error: error instanceof Error ? error.message : '生成歌名和结构失败'
      };
    }
  }

  /**
   * 生成完整歌词和歌名
   */
  async generateCompleteLyrics(
    answers: UserAnswers, 
    round1Answers: UserAnswers,
    selectedTitle?: string | null,
    selectedVersion?: 'A' | 'B' | null,
    songStructure?: any | null
  ): Promise<AIResponse> {
    console.log('🎵 [AI Service] 开始生成完整歌词和歌名');
    console.log('📝 [AI Service] 第二轮答案:', JSON.stringify(answers, null, 2));
    console.log('📝 [AI Service] 第一轮答案:', JSON.stringify(round1Answers, null, 2));
    console.log('📝 [AI Service] 选中的歌名:', selectedTitle);
    console.log('📝 [AI Service] 选中的版本:', selectedVersion);
    console.log('📝 [AI Service] 歌曲结构:', JSON.stringify(songStructure, null, 2));
    
    try {
      const { generateCompleteLyricsPrompt } = await import('./promptTemplates');
      const prompt = generateCompleteLyricsPrompt(answers, round1Answers, selectedTitle, selectedVersion, songStructure);

      console.log('🤖 [AI Service] 生成的提示词:', prompt.substring(0, 200) + '...');

      const response = await this.callOpenAI(prompt, {
        max_tokens: 3000,
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
  ): Promise<AIResponse> {
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
   * 调用DeepSeek API
   */
  private async callOpenAI(prompt: string, options: any = {}): Promise<AIResponse> {
    console.log('🚀 [AI Service] 开始调用DeepSeek API');
    console.log('🔧 [AI Service] 请求参数:', {
      model: options.model || 'deepseek-chat',
      max_tokens: options.max_tokens || 2000,
      temperature: options.temperature || 0.8,
      promptLength: prompt.length
    });

    if (!this.apiKey) {
      console.error('❌ [AI Service] API密钥未配置');
      return {
        success: false,
        error: 'API密钥未配置'
      };
    }

    try {
      const requestBody = {
        model: options.model || 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: options.max_tokens || 1500,
        temperature: options.temperature || 0.8,
        stream: false
      };

      console.log('📤 [AI Service] 发送请求到:', `${this.baseUrl}/chat/completions`);
      console.log('📤 [AI Service] 请求体:', JSON.stringify(requestBody, null, 2));

      // 添加重试机制
      let lastError: Error | null = null;
      const maxRetries = 2;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`🔄 [AI Service] 尝试第 ${attempt} 次调用`);
          
          const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            signal: AbortSignal.timeout(this.timeout)
          });

          console.log('📡 [AI Service] 响应状态:', response.status, response.statusText);

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ [AI Service] API请求失败:', {
              status: response.status,
              statusText: response.statusText,
              errorData: errorData
            });
            throw new Error(`API请求失败: ${response.status} ${errorData.error?.message || response.statusText}`);
          }

          const data = await response.json();
          console.log('✅ [AI Service] API响应成功:', {
            hasChoices: !!data.choices,
            choicesLength: data.choices?.length,
            usage: data.usage
          });
          
          return {
            success: true,
            data,
            usage: data.usage
          };
          
        } catch (error) {
          lastError = error as Error;
          console.error(`❌ [AI Service] 第 ${attempt} 次尝试失败:`, error);
          
          if (attempt < maxRetries) {
            const delay = attempt * 2000; // 递增延迟：2秒、4秒
            console.log(`⏳ [AI Service] ${delay/1000}秒后重试...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      
      // 所有重试都失败了
      throw lastError || new Error('所有重试都失败了');
    } catch (error) {
      console.error('💥 [AI Service] DeepSeek API调用失败:', error);
      console.error('💥 [AI Service] 错误详情:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack'
      });
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
   * 解析歌名备选和结构设计
   */
  private parseSongStructure(content: string): any {
    console.log('🔍 [AI Service] 开始解析AI返回内容');
    console.log('📄 [AI Service] 原始内容长度:', content.length);
    
    const result: any = {
      songTitles: [],
      versionA: { structure: '', examples: [] },
      versionB: { structure: '', examples: [] }
    };

    try {
      // 解析歌名备选
      const titleMatch = content.match(/\*\*歌名备选：\*\*\s*([\s\S]*?)(?=\*\*Version|$)/);
      if (titleMatch) {
        const titleSection = titleMatch[1];
        const titleLines = titleSection.split('\n');
        for (const line of titleLines) {
          const trimmedLine = line.trim();
          if (/^\d+\./.test(trimmedLine)) {
            const title = trimmedLine
              .replace(/^\d+\.\s*/, '')
              .replace(/（默认推荐）/, '')
              .replace(/《/g, '')
              .replace(/》/g, '')
              .trim();
            if (title) {
              result.songTitles.push(title);
            }
          }
        }
      }

      // 解析Version A
      const versionAMatch = content.match(/\*\*Version A（故事型）结构：\*\*\s*([\s\S]*?)(?=\*\*Version A 主歌画面举例|$)/);
      if (versionAMatch) {
        result.versionA.structure = versionAMatch[1].trim();
      }

      const versionAExamplesMatch = content.match(/\*\*Version A 主歌画面举例：\*\*\s*([\s\S]*?)(?=\*\*Version B|$)/);
      if (versionAExamplesMatch) {
        const examplesSection = versionAExamplesMatch[1];
        console.log('🔍 [AI Service] Version A 示例部分:', examplesSection);
        
        // 按主歌分割
        const mainSongMatches = examplesSection.match(/主歌\d+：\s*([\s\S]*?)(?=主歌\d+：|$)/g);
        if (mainSongMatches) {
          for (const match of mainSongMatches) {
            const example = match.replace(/主歌\d+：\s*/, '').trim();
            if (example) {
              result.versionA.examples.push(example);
            }
          }
        }
      }

      // 解析Version B
      const versionBMatch = content.match(/\*\*Version B（情感型）结构：\*\*\s*([\s\S]*?)(?=\*\*Version B 主歌画面举例|$)/);
      if (versionBMatch) {
        result.versionB.structure = versionBMatch[1].trim();
      }

      const versionBExamplesMatch = content.match(/\*\*Version B 主歌画面举例：\*\*\s*([\s\S]*?)$/);
      if (versionBExamplesMatch) {
        const examplesSection = versionBExamplesMatch[1];
        console.log('🔍 [AI Service] Version B 示例部分:', examplesSection);
        
        // 按主歌分割
        const mainSongMatches = examplesSection.match(/主歌\d+：\s*([\s\S]*?)(?=主歌\d+：|$)/g);
        if (mainSongMatches) {
          for (const match of mainSongMatches) {
            const example = match.replace(/主歌\d+：\s*/, '').trim();
            if (example) {
              result.versionB.examples.push(example);
            }
          }
        }
      }

      console.log('✅ [AI Service] 解析完成:', {
        songTitlesCount: result.songTitles.length,
        versionAStructure: result.versionA.structure.length > 0,
        versionAExamplesCount: result.versionA.examples.length,
        versionBStructure: result.versionB.structure.length > 0,
        versionBExamplesCount: result.versionB.examples.length
      });

    } catch (error) {
      console.error('❌ [AI Service] 解析失败:', error);
    }

    return result;
  }

  /**
   * 解析完整歌词和歌名
   */
  private parseCompleteLyrics(content: string): { lyrics: string; title: string } {
    console.log('🔍 [AI Service] 开始解析完整歌词和歌名');
    console.log('📄 [AI Service] 原始内容长度:', content.length);
    
    let title = '';
    let lyrics = '';

    try {
      // 解析歌名
      const titleMatch = content.match(/\*\*歌名：\*\*\s*([^\n]+)/);
      if (titleMatch) {
        title = titleMatch[1].trim();
        console.log('✅ [AI Service] 解析到歌名:', title);
      }

      // 解析完整歌词
      const lyricsMatch = content.match(/\*\*完整歌词：\*\*\s*([\s\S]*?)$/);
      if (lyricsMatch) {
        lyrics = lyricsMatch[1].trim();
        console.log('✅ [AI Service] 解析到歌词，长度:', lyrics.length);
        console.log('📄 [AI Service] 歌词内容预览:', lyrics.substring(0, 200) + '...');
      }

      // 如果没有找到标准格式，尝试其他格式
      if (!title || !lyrics) {
        const lines = content.split('\n');
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
      }

      console.log('✅ [AI Service] 解析完成:', {
        hasTitle: !!title,
        titleLength: title.length,
        hasLyrics: !!lyrics,
        lyricsLength: lyrics.length
      });

    } catch (error) {
      console.error('❌ [AI Service] 解析完整歌词失败:', error);
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
