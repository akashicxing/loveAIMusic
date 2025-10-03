# 为爱而歌 - AI 情歌创作平台

<div align="center">

![为爱而歌](https://images.pexels.com/photos/1616403/pexels-photo-1616403.jpeg?auto=compress&cs=tinysrgb&w=800)

**用 AI 为你的爱情谱写专属旋律，让每一个难忘的瞬间都化作动人的歌声**

[![Next.js](https://img.shields.io/badge/Next.js-13.5-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.x-ff69b4?style=flat-square)](https://www.framer.com/motion/)

</div>

---

## 📖 目录

- [✨ 项目简介](#-项目简介)
- [🎯 核心功能](#-核心功能)
- [🛠️ 技术栈](#️-技术栈)
- [📦 快速开始](#-快速开始)
- [📁 项目结构](#-项目结构)
- [🎨 设计系统](#-设计系统)
- [🔧 配置说明](#-配置说明)
- [📝 内容管理](#-内容管理)
- [🚀 部署指南](#-部署指南)
- [🧪 测试](#-测试)
- [🤝 贡献指南](#-贡献指南)
- [📄 许可证](#-许可证)

---

## ✨ 项目简介

**为爱而歌** 是一个基于 AI 技术的情歌创作平台，让每一对情侣都能拥有属于自己的专属情歌。通过回答一系列温馨的问题，AI 将为您创作出充满情感的歌词和旋律。

### 💝 为什么选择我们？

- 🎵 **8种音乐风格**：从浪漫抒情到活力流行，总有一款适合你们
- ✍️ **个性化创作**：基于你们的真实故事，创作独一无二的歌词
- 🎨 **精美设计**：浪漫的粉紫渐变主题，每个细节都充满爱意
- 📱 **移动端优化**：在任何设备上都能获得完美体验
- 💾 **作品管理**：保存和管理你的所有创作

---

## 🎯 核心功能

### 1. 🏠 首页展示
- 动态浪漫背景动画
- 核心功能介绍卡片
- 流畅的滚动交互体验

### 2. 🎵 音乐风格展示
- 8种精心设计的音乐风格
- 每种风格包含：
  - 详细介绍和标签
  - 情绪氛围和节奏速度
  - 演唱风格建议
  - 预览音频播放器
  - 完整歌词查看

### 3. ✨ 创作工具
- **两轮问答系统**：
  - 第一轮：基础信息（相识、性格、喜好等）
  - 第二轮：深度挖掘（故事、回忆、期望等）
- 进度条实时显示
- 草稿自动保存和恢复
- 平滑过渡动画

### 4. 📚 我的作品
- 作品列表展示
- 音频播放器（播放/暂停/进度/音量控制）
- 歌词分段显示
- 作品详情查看
- 分享和下载功能

### 5. 👥 关于我们
- 团队故事和使命
- 核心团队成员介绍
- 数据统计展示
- 社交媒体二维码
- 联系方式

---

## 🛠️ 技术栈

### 核心框架
- **Next.js 13.5** - React 框架，支持 SSR/SSG
- **React 18.2** - UI 库
- **TypeScript 5.2** - 类型安全

### 样式和动画
- **Tailwind CSS 3.3** - 实用优先的 CSS 框架
- **Framer Motion 12.x** - 强大的动画库
- **shadcn/ui** - 高质量的 UI 组件库

### 状态管理
- **Zustand 5.0** - 轻量级状态管理

### 表单处理
- **React Hook Form 7.x** - 高性能表单库
- **Zod 3.x** - TypeScript 优先的模式验证

### 图标和图片
- **Lucide React** - 精美的图标库
- **Pexels** - 高质量的免费图库

---

## 📦 快速开始

### 前置要求

- Node.js 18.x 或更高版本
- npm 或 yarn 包管理器

### 安装步骤

1. **克隆项目**

```bash
git clone https://github.com/your-username/lovesongs-ai.git
cd lovesongs-ai
```

2. **安装依赖**

```bash
npm install
# 或
yarn install
```

3. **配置环境变量**

创建 `.env.local` 文件：

```env
# Supabase 配置（如果需要）
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# 其他 API 配置
NEXT_PUBLIC_API_URL=your_api_url
```

4. **启动开发服务器**

```bash
npm run dev
# 或
yarn dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

5. **构建生产版本**

```bash
npm run build
npm run start
```

---

## 📁 项目结构

```
lovesongs-ai/
├── app/                          # Next.js 13 App Router
│   ├── about/                    # 关于我们页面
│   │   └── page.tsx
│   ├── create/                   # 创作工具页面
│   │   └── page.tsx
│   ├── my-works/                 # 我的作品页面
│   │   └── page.tsx
│   ├── api/                      # API 路由
│   │   └── questions/
│   │       └── [round]/
│   │           └── route.ts
│   ├── globals.css               # 全局样式
│   ├── layout.tsx                # 根布局
│   └── page.tsx                  # 首页
│
├── components/                   # React 组件
│   ├── ui/                       # shadcn/ui 组件
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── DraftRecoveryDialog.tsx   # 草稿恢复对话框
│   ├── LandingHero.tsx           # 首页 Hero 区域
│   ├── MusicShowcase.tsx         # 音乐风格展示
│   ├── Navigation.tsx            # 导航栏
│   ├── ProgressBar.tsx           # 进度条
│   ├── QuestionForm.tsx          # 问题表单
│   ├── RomanticBackground.tsx    # 浪漫背景
│   ├── SummaryPage.tsx           # 总结页面
│   └── TransitionScreen.tsx      # 过渡屏幕
│
├── data/                         # 数据文件
│   ├── round1.json               # 第一轮问题
│   ├── round2.json               # 第二轮问题
│   └── musicStyles.json          # 音乐风格数据（多个位置）
│
├── hooks/                        # 自定义 Hooks
│   └── use-toast.ts              # Toast 通知
│
├── lib/                          # 工具函数
│   └── utils.ts                  # 通用工具
│
├── store/                        # 状态管理
│   └── formStore.ts              # 表单状态 (Zustand)
│
├── types/                        # TypeScript 类型
│   └── questions.ts              # 问题类型定义
│
├── public/                       # 静态资源
│   └── data/
│       └── musicStyles.json
│
├── .env.local                    # 环境变量（本地）
├── .gitignore                    # Git 忽略文件
├── components.json               # shadcn/ui 配置
├── next.config.js                # Next.js 配置
├── package.json                  # 项目依赖
├── postcss.config.js             # PostCSS 配置
├── tailwind.config.ts            # Tailwind CSS 配置
└── tsconfig.json                 # TypeScript 配置
```

---

## 🎨 设计系统

### 色彩方案

```css
/* 主色调 - 浪漫粉紫渐变 */
--pink-400: #f472b6      /* 粉色 */
--pink-500: #ec4899      /* 深粉色 */
--purple-400: #c084fc    /* 紫色 */
--purple-500: #a855f7    /* 深紫色 */

/* 渐变背景 */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
```

### 设计原则

1. **浪漫优雅**
   - 粉紫渐变为主色调
   - 玻璃质感卡片 (glass-card)
   - 柔和的阴影和发光效果

2. **响应式设计**
   - 移动优先 (Mobile First)
   - 断点：sm(640px), md(768px), lg(1024px), xl(1280px)
   - 所有组件都支持完美的移动端显示

3. **动画交互**
   - 使用 Framer Motion 实现流畅动画
   - 悬停 (hover) 和点击 (tap) 反馈
   - 滚动触发动画 (scroll-triggered)

4. **无障碍性**
   - 语义化 HTML
   - ARIA 标签
   - 键盘导航支持

### 组件样式

```tsx
// 玻璃卡片样式
className="glass-card rounded-3xl p-8 space-y-6"

// 渐变文字
className="text-gradient"

// 发光效果
className="glow-pink"

// 按钮样式
className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
```

---

## 🔧 配置说明

### 1. Tailwind CSS 配置

`tailwind.config.ts` 包含自定义颜色、动画和实用类。

**自定义类：**

```css
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.text-gradient {
  background: linear-gradient(135deg, #fda4af 0%, #f0abfc 50%, #fda4af 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.glow-pink {
  box-shadow: 0 0 20px rgba(236, 72, 153, 0.5);
}
```

### 2. Next.js 配置

`next.config.js` 配置图片域名等：

```javascript
module.exports = {
  images: {
    domains: ['images.pexels.com'],
  },
}
```

### 3. TypeScript 配置

`tsconfig.json` 配置路径别名：

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

## 📝 内容管理

### 修改音乐风格数据

编辑 `public/data/musicStyles.json` 或 `src/data/musicStyles.json`：

```json
{
  "id": "romantic-ballad",
  "name": "浪漫抒情",
  "englishName": "Romantic Ballad",
  "description": "温柔细腻的旋律...",
  "tags": ["温馨", "感人", "真挚"],
  "mood": "温柔缠绵",
  "tempo": "慢板 (60-80 BPM)",
  "difficulty": "中等",
  "vocalSuggestions": ["柔美女声", "深情男声"],
  "previewAudio": "/audio/romantic-preview.mp3",
  "lyrics": [
    {
      "section": "主歌",
      "sectionEn": "Verse 1",
      "content": "歌词内容..."
    }
  ]
}
```

### 修改问答题目

编辑 `data/round1.json` 和 `data/round2.json`：

```json
{
  "id": "question-id",
  "question": "问题内容？",
  "description": "问题的详细说明",
  "type": "text",
  "required": true,
  "placeholder": "请输入...",
  "maxLength": 200
}
```

**字段类型：**

- `type`: "text" | "textarea" | "select" | "radio" | "date"
- `required`: 是否必填
- `options`: 选项（用于 select/radio）
- `validation`: 验证规则

### 修改团队信息

编辑 `app/about/page.tsx` 中的 `teamMembers` 数组：

```typescript
const teamMembers = [
  {
    name: '姓名',
    role: '职位',
    avatar: 'https://example.com/avatar.jpg',
    bio: '个人简介',
    heart: '个人标语'
  }
]
```

### 替换二维码

编辑 `app/about/page.tsx` 中的 `socialLinks` 数组：

```typescript
const socialLinks = [
  {
    name: 'WeChat',
    icon: MessageCircle,
    qrCode: 'https://example.com/wechat-qr.png', // 替换为真实二维码
    handle: '@你的账号'
  }
]
```

**二维码要求：**
- 尺寸：400x400px 或更高
- 格式：PNG（推荐透明背景）
- 清晰度：高清，易于扫描

---

## 🚀 部署指南

### Vercel 部署（推荐）

1. **连接 GitHub**
   - 访问 [vercel.com](https://vercel.com)
   - 导入你的 GitHub 仓库

2. **配置环境变量**
   - 在 Vercel 控制台添加环境变量
   - 与 `.env.local` 保持一致

3. **部署**
   - Vercel 会自动构建和部署
   - 每次 push 都会自动重新部署

### 其他平台

**Netlify:**
```bash
npm run build
# 部署 .next 文件夹
```

**自托管:**
```bash
npm run build
npm run start
# 或使用 PM2
pm2 start npm --name "lovesongs" -- start
```

### Docker 部署

创建 `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

构建和运行：

```bash
docker build -t lovesongs-ai .
docker run -p 3000:3000 lovesongs-ai
```

---

## 🧪 测试

### 运行类型检查

```bash
npm run typecheck
```

### 运行 Lint

```bash
npm run lint
```

### 构建测试

```bash
npm run build
```

确保没有错误后再部署。

---

## 🎯 开发最佳实践

### 1. 代码风格

- 使用 TypeScript 类型定义
- 遵循 ESLint 规则
- 组件使用函数式编程
- 使用有意义的变量名

### 2. 组件开发

```tsx
// ✅ 推荐
export default function ComponentName() {
  // hooks
  const [state, setState] = useState();

  // effects
  useEffect(() => {}, []);

  // handlers
  const handleClick = () => {};

  // render
  return <div>...</div>;
}
```

### 3. 状态管理

- 本地状态使用 useState
- 跨组件状态使用 Zustand
- 表单状态使用 React Hook Form

### 4. 性能优化

- 使用 `next/image` 优化图片
- 懒加载组件 (`React.lazy`)
- 避免不必要的重渲染
- 使用 `useMemo` 和 `useCallback`

### 5. 文件组织

- 一个文件一个组件
- 相关组件放在同一目录
- 共享组件放在 `components/ui`
- 类型定义放在 `types/`

---

## 🐛 常见问题

### Q: 开发服务器启动失败？
**A:** 检查 Node.js 版本是否 >= 18，删除 `node_modules` 和 `package-lock.json` 后重新安装。

### Q: 图片不显示？
**A:** 确保图片 URL 已添加到 `next.config.js` 的 `images.domains` 中。

### Q: 构建失败？
**A:** 运行 `npm run typecheck` 检查类型错误，修复后重新构建。

### Q: 样式不生效？
**A:** 检查 Tailwind CSS 配置，确保文件路径在 `content` 数组中。

### Q: 动画卡顿？
**A:** 减少同时运行的动画数量，使用 `will-change` CSS 属性。

---

## 📚 相关资源

### 官方文档
- [Next.js 文档](https://nextjs.org/docs)
- [React 文档](https://react.dev)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Framer Motion 文档](https://www.framer.com/motion/)
- [shadcn/ui 文档](https://ui.shadcn.com)

### 设计资源
- [Pexels](https://www.pexels.com) - 免费图片
- [Lucide Icons](https://lucide.dev) - 图标库
- [Coolors](https://coolors.co) - 配色方案

### 学习资源
- [TypeScript 教程](https://www.typescriptlang.org/docs/)
- [Next.js 教程](https://nextjs.org/learn)
- [Tailwind CSS 教程](https://tailwindcss.com/docs/utility-first)

---

## 🤝 贡献指南

我们欢迎任何形式的贡献！

### 贡献方式

1. **Fork 项目**
2. **创建功能分支** (`git checkout -b feature/AmazingFeature`)
3. **提交更改** (`git commit -m 'Add some AmazingFeature'`)
4. **推送到分支** (`git push origin feature/AmazingFeature`)
5. **开启 Pull Request**

### 代码规范

- 遵循现有代码风格
- 添加必要的注释
- 更新相关文档
- 确保所有测试通过

### 报告 Bug

使用 GitHub Issues，包含：
- 详细的问题描述
- 复现步骤
- 期望行为
- 截图（如适用）
- 环境信息（浏览器、操作系统等）

---

## 📧 联系我们

- **邮箱**: contact@lovesongs.ai
- **微信**: @为爱而歌官方
- **微博**: @为爱而歌AI
- **GitHub**: [@lovesongs-ai](https://github.com/lovesongs-ai)

---

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

---

## 💖 致谢

感谢所有为这个项目做出贡献的开发者和设计师！

特别感谢：
- [Next.js](https://nextjs.org/) 团队
- [Vercel](https://vercel.com/) 提供的优秀平台
- [shadcn](https://twitter.com/shadcn) 的 UI 组件库
- [Pexels](https://www.pexels.com) 提供的免费图片资源
- 所有使用和支持我们的情侣们 ❤️

---

<div align="center">

**用音乐记录爱情，让每一份爱都有专属的旋律** 🎵💕

Made with ❤️ by 为爱而歌团队

[网站](https://lovesongs.ai) · [反馈](https://github.com/lovesongs-ai/issues) · [文档](https://docs.lovesongs.ai)

</div>
