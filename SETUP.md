# 环境配置说明

## 🚀 快速开始

### 1. 设置环境变量

复制环境变量模板并配置：

```bash
cp ENV_TEMPLATE.txt .env.local
```

然后编辑 `.env.local` 文件，将以下值替换为实际配置：

```env
# DeepSeek API配置
OPENAI_API_KEY=your_deepseek_api_key
OPENAI_API_URL=https://api.deepseek.com/v1

# MySQL数据库配置
DATABASE_URL=mysql://username:password@host:port/database_name
DATABASE_HOST=your_database_host
DATABASE_PORT=20500
DATABASE_NAME=your_database_name
DATABASE_USER=your_database_user
DATABASE_PASSWORD=your_database_password

# 腾讯云COS配置
TENCENT_SECRET_ID=your_tencent_secret_id
TENCENT_SECRET_KEY=your_tencent_secret_key
TENCENT_COS_BUCKET=your_bucket_name
TENCENT_COS_REGION=ap-shanghai
NEXT_PUBLIC_FILE_BASE_URL=https://your-domain.com
```

### 2. 启动开发服务器

```bash
npm run dev
```

### 3. 测试API连接

访问以下URL测试DeepSeek API：

- **连接测试**: `POST http://localhost:3000/api/test/deepseek`
  ```json
  {
    "testType": "connection"
  }
  ```

- **歌词生成测试**: `POST http://localhost:3000/api/test/deepseek`
  ```json
  {
    "testType": "lyrics",
    "answers": {
      "recipientNickname": "小宝贝",
      "relationship": "couple",
      "memoryScenes": ["咖啡厅的初次相遇"],
      "coreTheme": "guard",
      "songTone": "gentle"
    }
  }
  ```

### 4. 访问应用

打开浏览器访问：http://localhost:3000

## 🔧 API端点说明

### 测试端点

- `GET /api/test/deepseek` - 查看API使用说明
- `POST /api/test/deepseek` - 测试DeepSeek API连接和歌词生成

### 核心API端点

- `POST /api/ai/generate-basic-lyrics` - 生成基础歌词
- `POST /api/ai/generate-complete-lyrics` - 生成完整歌词
- `POST /api/ai/generate-music` - 生成音乐音频
- `POST /api/works/generate` - 完整作品生成流程
- `GET /api/works/[id]/status` - 查询作品生成状态

## 📋 功能流程

1. **用户填写第一轮问题** (9个问题)
2. **AI生成基础歌词** (使用DeepSeek)
3. **用户填写第二轮问题** (7个问题)
4. **AI生成完整歌词+歌名** (使用DeepSeek)
5. **用户选择音乐风格** (8种风格)
6. **SunoAI生成音频** (使用云雾API)
7. **文件存储到云存储** (腾讯云COS)
8. **数据保存到MySQL** (用户信息和作品记录)

## 🎯 测试建议

1. 先测试API连接是否正常
2. 测试歌词生成功能
3. 在浏览器中走一遍完整的用户流程
4. 检查数据库和云存储配置

## ⚠️ 注意事项

- 确保所有环境变量已正确配置
- 确保MySQL数据库已创建并可以连接
- 确保腾讯云COS存储桶已创建并配置正确
- 确保DeepSeek API密钥有效且有足够额度
