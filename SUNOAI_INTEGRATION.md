# SunoAI音乐生成集成

## ⚠️ 重要提醒

**SunoAI音乐生成服务费用很高，请谨慎使用！**

- 每次调用都会产生费用
- 建议只在确认需要时才进行测试
- 测试前请确保已充分了解费用情况

## 功能概述

本系统集成了SunoAI音乐生成服务，可以根据用户创作的歌词、歌名和选择的音乐风格生成完整的MP3音乐文件。

## API配置

### 环境变量

在 `.env.local` 文件中配置：

```env
# SunoAI音乐生成API配置 (费用很高，谨慎使用)
YUNWU_API_KEY=sk-4qawU2ruWc4dAaROzuy7AQNHSlowgFKYKOfQrCPRtva2CK37
YUNWU_API_BASE_URL=https://yunwu.ai
```

### API端点

- **音乐生成**: `POST /api/music/generate`
- **状态检查**: `GET /api/music/status/[taskId]`

## 使用流程

### 1. 用户操作流程

1. 完成歌词创作
2. 选择音乐风格（8种可选）
3. 点击"生成音乐"按钮
4. 系统提交任务到SunoAI
5. 用户等待音乐生成完成
6. 获取生成的MP3文件

### 2. 技术实现流程

```
用户选择音乐风格
    ↓
获取风格信息和提示词
    ↓
调用 /api/music/generate
    ↓
SunoService.generateMusic()
    ↓
POST https://yunwu.ai/suno/submit/music
    ↓
返回任务ID
    ↓
定期检查状态
    ↓
获取生成的音频URL
```

## API参数说明

### 音乐生成请求

```typescript
{
  "prompt": "歌词内容",           // 完整的歌词文本
  "mv": "chirp-v4",            // 模型版本，固定使用chirp-v4
  "title": "歌名",             // 歌曲标题
  "tags": "音乐风格标签",        // 从音乐风格数据中获取
  "gpt_description_prompt": "风格提示词" // SunoAI专用的风格描述
}
```

### 音乐风格数据

每个音乐风格包含：

```typescript
{
  "id": "style_1",
  "name": "深情抒情民谣",
  "description": "钢琴主导的温暖民谣，适合深情表白",
  "tags": ["抒情", "民谣", "温暖", "深情"],
  "tempo": "慢板 (65-75 BPM)",
  "sunoPromptTemplate": "Emotional Chinese ballad, slow tempo 65-75 BPM...",
  "vocalSuggestions": ["soft male", "gentle female", "male and female duet"]
}
```

## 文件结构

```
lib/
├── sunoService.ts              # SunoAI服务封装
app/api/music/
├── generate/route.ts           # 音乐生成API
└── status/[taskId]/route.ts    # 状态检查API
components/
└── MusicStyleSelector.tsx      # 音乐风格选择器
data/
└── musicStyles.json           # 音乐风格配置
```

## 安全注意事项

1. **API密钥保护**: 确保API密钥不会泄露到客户端
2. **费用控制**: 实现调用频率限制和费用监控
3. **错误处理**: 完善的错误处理和用户提示
4. **日志记录**: 详细记录所有API调用和费用产生

## 测试建议

### 开发环境测试

1. 使用简短的测试歌词
2. 选择简单的音乐风格
3. 监控API调用日志
4. 确认费用产生情况

### 生产环境部署

1. 设置费用上限
2. 实现用户权限控制
3. 添加使用量统计
4. 建立监控告警

## 故障排除

### 常见问题

1. **API密钥错误**: 检查环境变量配置
2. **网络超时**: 增加请求超时时间
3. **费用不足**: 检查账户余额
4. **生成失败**: 检查歌词格式和长度

### 日志查看

```bash
# 查看SunoAI相关日志
grep "SunoAI" logs/app.log

# 查看API调用日志
grep "音乐生成" logs/app.log
```

## 未来优化

1. **缓存机制**: 缓存已生成的音乐
2. **批量处理**: 支持批量音乐生成
3. **质量优化**: 根据用户反馈优化提示词
4. **成本优化**: 实现智能费用控制

---

**再次提醒：SunoAI服务费用很高，请谨慎使用！**
