# 开发者文档

本文档提供项目的快速开发指南和常用操作。

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm run start

# 类型检查
npm run typecheck

# 代码检查
npm run lint
```

---

## 📋 常用开发任务

### 1. 添加新页面

在 `app/` 目录下创建新文件夹：

```tsx
// app/new-page/page.tsx
export default function NewPage() {
  return <div>新页面内容</div>;
}
```

路由会自动生成：`/new-page`

### 2. 添加新组件

在 `components/` 目录下创建：

```tsx
// components/NewComponent.tsx
'use client'; // 如果需要客户端交互

import { motion } from 'framer-motion';

export default function NewComponent() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      组件内容
    </motion.div>
  );
}
```

### 3. 添加 API 路由

在 `app/api/` 目录下创建：

```tsx
// app/api/new-endpoint/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Success' });
}

export async function POST(request: Request) {
  const data = await request.json();
  return NextResponse.json({ data });
}
```

### 4. 修改音乐风格

编辑 `public/data/musicStyles.json`：

```json
{
  "id": "unique-id",
  "name": "风格名称",
  "englishName": "Style Name",
  "description": "风格描述",
  "tags": ["标签1", "标签2"],
  "mood": "情绪描述",
  "tempo": "节奏描述",
  "difficulty": "简单|中等|困难",
  "vocalSuggestions": ["建议1", "建议2"],
  "previewAudio": "/audio/preview.mp3",
  "lyrics": [...]
}
```

### 5. 修改问答题目

编辑 `data/round1.json` 或 `data/round2.json`：

```json
{
  "id": "question-id",
  "question": "问题内容？",
  "description": "问题说明",
  "type": "text|textarea|select|radio|date",
  "required": true,
  "placeholder": "提示文字",
  "maxLength": 200,
  "options": ["选项1", "选项2"] // select/radio 类型需要
}
```

### 6. 添加新的状态

使用 Zustand 在 `store/` 目录：

```tsx
// store/newStore.ts
import { create } from 'zustand';

interface NewState {
  value: string;
  setValue: (value: string) => void;
}

export const useNewStore = create<NewState>((set) => ({
  value: '',
  setValue: (value) => set({ value }),
}));
```

使用：

```tsx
import { useNewStore } from '@/store/newStore';

function Component() {
  const { value, setValue } = useNewStore();
  return <input value={value} onChange={(e) => setValue(e.target.value)} />;
}
```

---

## 🎨 样式开发

### 使用 Tailwind CSS

```tsx
// 基础样式
<div className="bg-pink-500 text-white p-4 rounded-lg">

// 响应式
<div className="text-sm sm:text-base md:text-lg lg:text-xl">

// 悬停效果
<button className="hover:bg-pink-600 hover:scale-105 transition-all">

// 玻璃质感
<div className="glass-card">

// 渐变文字
<h1 className="text-gradient">
```

### 自定义动画

```tsx
import { motion } from 'framer-motion';

// 淡入
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }}
>

// 滑入
<motion.div
  initial={{ x: -100 }}
  animate={{ x: 0 }}
  transition={{ type: 'spring' }}
>

// 悬停动画
<motion.div
  whileHover={{ scale: 1.1, y: -5 }}
  whileTap={{ scale: 0.95 }}
>

// 滚动触发
<motion.div
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
>
```

---

## 🔧 配置文件说明

### next.config.js

```javascript
module.exports = {
  // 图片域名白名单
  images: {
    domains: ['images.pexels.com', 'example.com'],
  },

  // 重定向
  async redirects() {
    return [
      {
        source: '/old-path',
        destination: '/new-path',
        permanent: true,
      },
    ];
  },
};
```

### tailwind.config.ts

```typescript
export default {
  theme: {
    extend: {
      // 自定义颜色
      colors: {
        'custom-pink': '#ec4899',
      },

      // 自定义动画
      animation: {
        'custom': 'custom 2s ease-in-out infinite',
      },

      keyframes: {
        custom: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
      },
    },
  },
};
```

---

## 🐛 调试技巧

### 1. 查看组件重渲染

```tsx
import { useEffect } from 'react';

function Component() {
  useEffect(() => {
    console.log('Component rendered');
  });
}
```

### 2. 检查状态变化

```tsx
const [state, setState] = useState(initialState);

useEffect(() => {
  console.log('State changed:', state);
}, [state]);
```

### 3. 调试 API 请求

```tsx
const response = await fetch('/api/endpoint');
console.log('Response:', await response.json());
```

### 4. React DevTools

- 安装 React DevTools 浏览器扩展
- 查看组件树和 props
- 分析性能

### 5. Next.js 调试

```bash
# 启用详细日志
NODE_OPTIONS='--inspect' npm run dev

# 查看构建分析
npm run build -- --profile
```

---

## 📦 依赖管理

### 添加新依赖

```bash
# 生产依赖
npm install package-name

# 开发依赖
npm install -D package-name
```

### 更新依赖

```bash
# 检查过时的包
npm outdated

# 更新所有包
npm update

# 更新特定包
npm update package-name
```

### 移除依赖

```bash
npm uninstall package-name
```

---

## 🚀 性能优化

### 1. 图片优化

```tsx
import Image from 'next/image';

<Image
  src="/image.jpg"
  alt="描述"
  width={800}
  height={600}
  loading="lazy"
  quality={85}
/>
```

### 2. 代码分割

```tsx
import dynamic from 'next/dynamic';

const DynamicComponent = dynamic(() => import('@/components/Heavy'), {
  loading: () => <p>Loading...</p>,
  ssr: false, // 禁用服务端渲染
});
```

### 3. 优化重渲染

```tsx
import { useMemo, useCallback } from 'react';

// 缓存计算结果
const memoizedValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);

// 缓存函数
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

### 4. 字体优化

```tsx
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

---

## 🧪 测试建议

### 手动测试清单

- [ ] 首页加载正常
- [ ] 所有导航链接工作
- [ ] 创作流程完整
- [ ] 表单验证正确
- [ ] 移动端显示正常
- [ ] 动画流畅
- [ ] 图片加载
- [ ] 音频播放
- [ ] 响应式布局

### 浏览器测试

- Chrome (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- Edge (最新版本)
- 移动端浏览器

### 设备测试

- iPhone (多种尺寸)
- Android (多种尺寸)
- iPad
- 桌面 (1920x1080, 1366x768)

---

## 📚 代码片段

### 浪漫背景组件模板

```tsx
export default function RomanticSection() {
  return (
    <div className="relative min-h-screen">
      <RomanticBackground />

      <div className="relative z-10 pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* 内容 */}
        </div>
      </div>
    </div>
  );
}
```

### 玻璃卡片模板

```tsx
<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  whileHover={{ y: -5 }}
  className="glass-card rounded-3xl p-8 space-y-6"
>
  {/* 卡片内容 */}
</motion.div>
```

### 带图标的标题

```tsx
<div className="flex items-center gap-3 pb-4 border-b border-white/10">
  <Heart className="w-6 h-6 text-pink-400 fill-pink-400" />
  <h2 className="text-3xl font-bold text-white">标题</h2>
</div>
```

### 响应式网格

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {items.map((item) => (
    <div key={item.id} className="glass-card p-6">
      {/* 网格项 */}
    </div>
  ))}
</div>
```

---

## 🔒 环境变量

### 开发环境

创建 `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 生产环境

在部署平台设置：

```env
NEXT_PUBLIC_API_URL=https://api.lovesongs.ai
NEXT_PUBLIC_SITE_URL=https://lovesongs.ai
```

### 使用环境变量

```tsx
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

**注意**: `NEXT_PUBLIC_` 前缀的变量会暴露给客户端！

---

## 📞 获取帮助

- 查看 [README.md](README.md) 了解项目概述
- 访问 [Next.js 文档](https://nextjs.org/docs)
- 查看 [Tailwind CSS 文档](https://tailwindcss.com/docs)
- 提交 [GitHub Issue](https://github.com/your-repo/issues)

---

## 💡 开发技巧

1. **使用 TypeScript**: 严格的类型检查能避免很多错误
2. **组件化思维**: 将 UI 拆分成可复用的小组件
3. **移动优先**: 先设计移动端，再适配桌面
4. **性能意识**: 注意包大小和渲染性能
5. **可访问性**: 使用语义化 HTML 和 ARIA 标签
6. **Git 提交**: 编写清晰的提交信息
7. **代码审查**: 合并前仔细检查代码
8. **文档更新**: 修改代码时同步更新文档

---

Happy Coding! 🎵💕
