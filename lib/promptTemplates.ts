/**
 * AI提示词模板系统
 * 用于生成歌词和音乐的核心提示词
 */

export interface UserAnswers {
  // 第一轮答案
  recipientNickname?: string;
  relationship?: string;
  metYear?: number;
  keyMoments?: string[];
  memoryScenes?: string[];
  coreTheme?: string;
  privateCode?: string;
  songTone?: string;
  avoidList?: string;
  
  // 第二轮答案
  coreConfession?: string;
  mustImages?: string[];
  chorusVow?: string;
  verseFocus?: string;
  factsLimit?: string;
  moodAdjectives?: string[];
  avoidConfirm?: string;
}

export interface MusicStyle {
  id: string;
  name: string;
  englishName: string;
  sunoPromptTemplate: string;
  vocalSuggestions: string[];
}

/**
 * 第一轮采集 → 歌名备选和结构设计模板
 */
export function generateSongStructurePrompt(answers: UserAnswers): string {
  const {
    recipientNickname,
    relationship,
    metYear,
    keyMoments = [],
    memoryScenes = [],
    coreTheme,
    privateCode,
    songTone,
    avoidList
  } = answers;

  // 关系映射
  const relationshipMap: Record<string, string> = {
    'couple': '情侣',
    'spouse': '夫妻',
    'fiance': '未婚夫妻',
    'crush': '暗恋对象',
    'partners': '伴侣'
  };

  // 主题映射
  const themeMap: Record<string, string> = {
    'guard': '守护与陪伴',
    'gratitude': '感恩与珍惜',
    'reconcile': '和解与理解',
    'confess': '告白与表白',
    'rekindle': '重燃与新生',
    'promise': '承诺与誓言',
    'miss': '思念与牵挂'
  };

  // 基调映射
  const toneMap: Record<string, string> = {
    'gentle': '温柔细腻',
    'passionate': '热烈深情',
    'nostalgic': '怀旧感伤',
    'firm': '坚定有力',
    'playful': '俏皮活泼'
  };

  const prompt = `
你是一位专业的中文歌词创作AI，请根据以下用户信息提供歌名备选和歌词结构设计：

## 用户信息
- 称呼对象：${recipientNickname || '未指定'}
- 关系：${relationshipMap[relationship || ''] || '未指定'}
- 相识年份：${metYear || '未指定'}
- 重要节点：${keyMoments.join('、') || '无'}
- 回忆场景：${memoryScenes.join('、') || '无'}
- 核心主题：${themeMap[coreTheme || ''] || '未指定'}
- 专属暗号：${privateCode || '无'}
- 歌曲基调：${toneMap[songTone || ''] || '未指定'}
- 避免内容：${avoidList || '无'}

## 创作要求
请提供以下三个部分：

### 1. 歌名备选（10个不同方向）
提供10个不同方向的歌名备选，体现用户故事的不同侧面，要求：
- 每个歌名4-8字
- 体现${themeMap[coreTheme || ''] || '核心主题'}
- 语言${toneMap[songTone || ''] || '温柔细腻'}
- 避免使用用户指定的敏感词汇

### 2. 歌词整体结构设计（2个版本）
提供两个不同版本的结构设计：

**Version A（故事型）**：
- 基于用户的具体回忆场景设计
- 体现时间线或情感发展
- 适合${toneMap[songTone || ''] || '温柔'}的基调

**Version B（情感型）**：
- 基于核心主题和情感层次设计
- 体现情感深度和变化
- 适合更深层的表达

### 3. 主歌画面举例
为每个版本提供2-3个主歌的具体画面示例：
- 每段4行，每行8-12字
- 融入用户的回忆场景和细节
- 体现${toneMap[songTone || ''] || '温柔细腻'}的语言风格
- 避免使用用户指定的敏感词汇

## 输出格式
请严格按照以下格式输出，不要添加其他内容：

**歌名备选：**
1. [歌名1]（默认推荐）
2. [歌名2]
3. [歌名3]
4. [歌名4]
5. [歌名5]
6. [歌名6]
7. [歌名7]
8. [歌名8]
9. [歌名9]
10. [歌名10]

**Version A（故事型）结构：**
[详细结构说明，包含各个部分的安排和情感发展]

**Version A 主歌画面举例：**
主歌1：[具体歌词示例，4行，每行8-12字]
主歌2：[具体歌词示例，4行，每行8-12字]

**Version B（情感型）结构：**
[详细结构说明，包含情感层次和表达方式]

**Version B 主歌画面举例：**
主歌1：[具体歌词示例，4行，每行8-12字]
主歌2：[具体歌词示例，4行，每行8-12字]

请开始创作：
`;

  return prompt.trim();
}

/**
 * 第二轮采集 + 基础歌词 → 完整歌词+歌名生成模板
 */
export function generateCompleteLyricsPrompt(
  answers: UserAnswers, 
  round1Answers: UserAnswers,
  selectedTitle?: string | null,
  selectedVersion?: 'A' | 'B' | null,
  songStructure?: any | null
): string {
  const {
    coreConfession,
    mustImages = [],
    chorusVow,
    verseFocus,
    factsLimit,
    moodAdjectives = [],
    avoidConfirm
  } = answers;

  // 誓言映射
  const vowMap: Record<string, string> = {
    'standBy': '不离不弃的陪伴',
    'throughStorm': '风雨同舟的坚持',
    'longTime': '来日方长的期待',
    'growOld': '白头到老的承诺',
    'againstWorld': '与世界对抗的勇气'
  };

  // 主歌重点映射
  const focusMap: Record<string, string> = {
    'memoryDetails': '回忆中的具体细节',
    'herCharacter': '对方的性格特点',
    'growthTogether': '共同成长的历程',
    'dailyLife': '日常生活的烟火气'
  };

  const prompt = `
你是一位专业的中文歌词创作AI，请根据用户信息创作完整歌词：

## 用户故事背景
- 称呼对象：${round1Answers.recipientNickname || '未指定'}
- 关系：${round1Answers.relationship || '未指定'}
- 相识年份：${round1Answers.metYear || '未指定'}
- 重要节点：${round1Answers.keyMoments?.join('、') || '无'}
- 回忆场景：${round1Answers.memoryScenes?.join('、') || '无'}
- 核心主题：${round1Answers.coreTheme || '未指定'}
- 歌曲基调：${round1Answers.songTone || '未指定'}

## 已确定的歌名和结构
- 歌名：${selectedTitle || '未选择'}（必须使用这个歌名）
- 版本：${selectedVersion || '未选择'}

## 选中的歌曲结构设计
${selectedVersion === 'A' && songStructure?.versionA ? `
**Version A 结构：**
${songStructure.versionA.structure}

**Version A 主歌示例：**
${songStructure.versionA.examples?.join('\n\n') || '无示例'}
` : ''}
${selectedVersion === 'B' && songStructure?.versionB ? `
**Version B 结构：**
${songStructure.versionB.structure}

**Version B 主歌示例：**
${songStructure.versionB.examples?.join('\n\n') || '无示例'}
` : ''}

## 歌词创作要求
- 核心告白句：${coreConfession || '未指定'}
- 必须意象：${mustImages.join('、') || '无'}
- 副歌誓言：${vowMap[chorusVow || ''] || '未指定'}
- 主歌重点：${focusMap[verseFocus || ''] || '未指定'}
- 氛围形容词：${moodAdjectives.join('、') || '无'}
- 避免内容：${avoidConfirm || '无'}

## 创作要求
1. 必须使用指定的歌名：${selectedTitle}
2. 必须融入核心告白句："${coreConfession}"
3. 必须包含指定的意象：${mustImages.join('、')}
4. 副歌要体现${vowMap[chorusVow || ''] || '承诺'}的情感
5. 主歌要重点描述${focusMap[verseFocus || ''] || '回忆细节'}
6. 整体氛围要体现：${moodAdjectives.join('、')}
7. 避免使用用户指定的敏感词汇
8. 歌词要完整、流畅、感人，符合${round1Answers.songTone || '温柔'}的基调

## 输出格式要求
请严格按照以下格式输出，不要添加任何其他内容：

**歌名：**
${selectedTitle}

**完整歌词：**
请按照选中的${selectedVersion}版本结构来创作完整歌词，参考上面的结构设计和主歌示例。

${selectedVersion === 'A' && songStructure?.versionA ? `
按照Version A的结构：${songStructure.versionA.structure}
` : ''}
${selectedVersion === 'B' && songStructure?.versionB ? `
按照Version B的结构：${songStructure.versionB.structure}
` : ''}

每行歌词8-12字，确保结构完整、情感连贯。

## 重要提醒
1. 必须使用指定的歌名：${selectedTitle}
2. 每行歌词必须是8-12字
3. 必须包含核心告白句："${coreConfession || '未指定'}"
4. 必须包含指定意象：${mustImages.join('、') || '无'}
5. 副歌要体现${vowMap[chorusVow || ''] || '承诺'}的情感
6. 整体氛围要体现：${moodAdjectives.join('、') || '无'}

请开始创作：
`;

  return prompt.trim();
}

/**
 * 歌词+歌名+音乐风格 → SunoAI音频生成模板
 */
export function generateSunoPrompt(
  lyrics: string,
  songTitle: string,
  musicStyle: MusicStyle,
  vocalType: string = 'gentle female'
): string {
  // 替换音乐风格模板中的占位符
  let sunoPrompt = musicStyle.sunoPromptTemplate;
  
  // 替换演唱类型占位符
  sunoPrompt = sunoPrompt.replace(/\[VOCAL_TYPE\]/g, vocalType);
  
  // 添加歌词和歌名信息
  const enhancedPrompt = `
${sunoPrompt}

**歌名：** ${songTitle}

**歌词：**
${lyrics}

**特殊要求：**
- 确保歌词与音乐风格完美匹配
- 演唱要体现歌词的情感深度
- 音乐编排要突出${musicStyle.name}的特色
- 整体效果要专业、感人、易记

请生成高质量的音频文件。
`;

  return enhancedPrompt.trim();
}

/**
 * 获取推荐的演唱类型
 */
export function getRecommendedVocalType(answers: UserAnswers): string {
  const { songTone, relationship } = answers;
  
  // 根据歌曲基调和关系推荐演唱类型
  if (songTone === 'gentle') {
    return 'gentle female';
  } else if (songTone === 'passionate') {
    return 'passionate male';
  } else if (songTone === 'nostalgic') {
    return 'melancholic female';
  } else if (songTone === 'firm') {
    return 'strong male';
  } else if (songTone === 'playful') {
    return 'cheerful female';
  }
  
  // 默认推荐
  return 'gentle female';
}

/**
 * 验证用户答案的完整性
 */
export function validateUserAnswers(answers: UserAnswers, round: 1 | 2): string[] {
  const errors: string[] = [];
  
  if (round === 1) {
    if (!answers.recipientNickname) errors.push('称呼/昵称不能为空');
    if (!answers.relationship) errors.push('关系类型不能为空');
    if (!answers.memoryScenes || answers.memoryScenes.length < 2) {
      errors.push('至少需要提供2个回忆场景');
    }
    if (!answers.coreTheme) errors.push('核心主题不能为空');
    if (!answers.songTone) errors.push('歌曲基调不能为空');
  } else if (round === 2) {
    if (!answers.coreConfession) errors.push('核心告白句不能为空');
    if (!answers.mustImages || answers.mustImages.length < 3) {
      errors.push('必须提供3个意象或细节');
    }
    if (!answers.chorusVow) errors.push('副歌誓言类型不能为空');
    if (!answers.verseFocus) errors.push('主歌重点不能为空');
    if (!answers.moodAdjectives || answers.moodAdjectives.length < 3) {
      errors.push('必须提供3个氛围形容词');
    }
  }
  
  return errors;
}

/**
 * 生成AI交互的上下文信息
 */
export function generateContextInfo(answers: UserAnswers): string {
  const {
    recipientNickname,
    relationship,
    metYear,
    keyMoments = [],
    memoryScenes = [],
    coreTheme,
    privateCode,
    songTone
  } = answers;

  return `
用户信息摘要：
- 对象：${recipientNickname}
- 关系：${relationship}
- 相识：${metYear}年
- 重要时刻：${keyMoments.join('、')}
- 回忆场景：${memoryScenes.join('、')}
- 核心主题：${coreTheme}
- 专属暗号：${privateCode || '无'}
- 歌曲基调：${songTone}
`.trim();
}
