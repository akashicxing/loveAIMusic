# 贡献指南

感谢你考虑为"为爱而歌"项目做出贡献！❤️

本文档将指导你如何为项目做出贡献。

---

## 📋 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
- [开发流程](#开发流程)
- [代码规范](#代码规范)
- [提交规范](#提交规范)
- [Pull Request 流程](#pull-request-流程)
- [问题反馈](#问题反馈)

---

## 行为准则

### 我们的承诺

为了营造一个开放和友好的环境，我们承诺：

- 使用友好和包容的语言
- 尊重不同的观点和经验
- 优雅地接受建设性批评
- 关注对社区最有利的事情
- 对其他社区成员表示同理心

### 不可接受的行为

- 使用性化的语言或图像
- 发表侮辱性评论
- 骚扰行为
- 公开或私下骚扰
- 未经许可发布他人的私人信息
- 其他不道德或不专业的行为

---

## 如何贡献

你可以通过以下方式为项目做出贡献：

### 🐛 报告 Bug

在提交 Bug 之前，请：

1. 检查是否已有相同的问题
2. 确认问题在最新版本中仍然存在
3. 收集必要的信息

Bug 报告应包含：

- **清晰的标题**
- **详细的描述**
- **复现步骤**
- **期望行为**
- **实际行为**
- **截图**（如适用）
- **环境信息**：
  - 浏览器版本
  - 操作系统
  - Node.js 版本
  - 其他相关信息

### ✨ 提出新功能

功能建议应包含：

- **功能描述**：清楚地描述你希望添加的功能
- **使用场景**：解释为什么需要这个功能
- **可选方案**：列出你考虑过的其他方案
- **设计草图**：如果可能，提供界面设计

### 📝 改进文档

文档改进包括：

- 修正拼写错误
- 改进说明清晰度
- 添加示例
- 翻译文档

### 💻 贡献代码

代码贡献包括：

- 修复 Bug
- 实现新功能
- 性能优化
- 代码重构

---

## 开发流程

### 1. Fork 项目

点击 GitHub 页面右上角的 "Fork" 按钮。

### 2. 克隆仓库

```bash
git clone https://github.com/your-username/lovesongs-ai.git
cd lovesongs-ai
```

### 3. 添加上游仓库

```bash
git remote add upstream https://github.com/lovesongs-ai/lovesongs-ai.git
```

### 4. 创建分支

```bash
git checkout -b feature/your-feature-name
# 或
git checkout -b fix/your-bug-fix
```

**分支命名规范：**

- `feature/` - 新功能
- `fix/` - Bug 修复
- `docs/` - 文档更新
- `style/` - 代码格式调整
- `refactor/` - 代码重构
- `test/` - 测试相关
- `chore/` - 构建或辅助工具变动

### 5. 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 进行你的修改...
```

### 6. 测试

```bash
# 类型检查
npm run typecheck

# 代码检查
npm run lint

# 构建测试
npm run build
```

### 7. 提交更改

```bash
git add .
git commit -m "feat: 添加新功能描述"
```

### 8. 保持同步

```bash
git fetch upstream
git rebase upstream/main
```

### 9. 推送到 Fork

```bash
git push origin feature/your-feature-name
```

### 10. 创建 Pull Request

在 GitHub 上创建 Pull Request，详细描述你的更改。

---

## 代码规范

### TypeScript

- 使用 TypeScript 编写所有代码
- 为所有函数和变量提供类型注解
- 避免使用 `any` 类型
- 使用接口 (interface) 定义对象结构

```typescript
// ✅ 推荐
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): User {
  // ...
}

// ❌ 不推荐
function getUser(id: any): any {
  // ...
}
```

### React 组件

- 使用函数组件和 Hooks
- 组件名使用 PascalCase
- Props 接口以组件名 + Props 命名

```tsx
// ✅ 推荐
interface ButtonProps {
  label: string;
  onClick: () => void;
}

export default function Button({ label, onClick }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}
```

### 样式

- 使用 Tailwind CSS 类名
- 按类别组织类名：布局、间距、颜色、排版等
- 使用响应式前缀：sm:, md:, lg:, xl:

```tsx
// ✅ 推荐
<div className="flex items-center justify-between p-4 bg-pink-500 rounded-lg">

// ❌ 不推荐
<div className="bg-pink-500 flex rounded-lg p-4 items-center justify-between">
```

### 文件组织

- 一个文件一个组件
- 组件文件使用 PascalCase
- 工具文件使用 camelCase
- 在文件顶部导入，按以下顺序：
  1. React / Next.js
  2. 第三方库
  3. 项目内部模块
  4. 类型定义
  5. 样式

```tsx
// ✅ 推荐顺序
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { UserProps } from '@/types';
import styles from './Component.module.css';
```

### 命名规范

- **变量**: camelCase - `userName`, `isActive`
- **常量**: UPPER_SNAKE_CASE - `MAX_COUNT`, `API_URL`
- **函数**: camelCase - `getUserData()`, `handleClick()`
- **组件**: PascalCase - `UserCard`, `NavigationMenu`
- **接口**: PascalCase - `UserProps`, `ApiResponse`
- **类型**: PascalCase - `UserId`, `UserRole`

### 注释

- 为复杂逻辑添加注释
- 使用 JSDoc 为函数添加文档

```typescript
/**
 * 获取用户信息
 * @param id - 用户 ID
 * @returns 用户对象
 */
function getUser(id: string): User {
  // ...
}
```

---

## 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/) 规范。

### 提交格式

```
<类型>[可选作用域]: <描述>

[可选正文]

[可选脚注]
```

### 类型

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响代码运行）
- `refactor`: 重构（既不是新增功能，也不是修复 Bug）
- `perf`: 性能优化
- `test`: 添加测试
- `chore`: 构建过程或辅助工具的变动
- `revert`: 回退提交

### 示例

```bash
# 新功能
git commit -m "feat: 添加用户登录功能"
git commit -m "feat(auth): 添加 OAuth 认证"

# Bug 修复
git commit -m "fix: 修复导航栏在移动端显示问题"
git commit -m "fix(navigation): 修复菜单点击无响应"

# 文档
git commit -m "docs: 更新 README 安装说明"

# 样式
git commit -m "style: 统一代码缩进为 2 空格"

# 重构
git commit -m "refactor: 优化音频播放器组件结构"

# 性能
git commit -m "perf: 优化图片加载性能"

# 测试
git commit -m "test: 添加表单验证测试"

# 构建
git commit -m "chore: 更新依赖版本"
```

### 提交正文

如果需要更详细的说明，在空行后添加正文：

```bash
git commit -m "feat: 添加用户登录功能

- 实现邮箱密码登录
- 添加记住密码功能
- 集成表单验证
"
```

---

## Pull Request 流程

### 创建 PR

1. **标题**：清晰描述更改内容
2. **描述**：详细说明更改的原因和方式
3. **关联 Issue**：使用 `Closes #123` 关联相关问题
4. **截图**：如果是 UI 更改，添加前后对比截图
5. **测试**：说明如何测试你的更改

### PR 模板

```markdown
## 更改类型

- [ ] Bug 修复
- [ ] 新功能
- [ ] 文档更新
- [ ] 代码重构
- [ ] 性能优化

## 描述

简要描述这个 PR 做了什么。

## 关联 Issue

Closes #(issue 编号)

## 更改内容

- 更改点 1
- 更改点 2
- 更改点 3

## 截图（如适用）

[添加截图]

## 测试

说明如何测试这些更改。

## 检查清单

- [ ] 代码遵循项目的代码规范
- [ ] 进行了自我代码审查
- [ ] 添加了必要的注释
- [ ] 更新了相关文档
- [ ] 没有产生新的警告
- [ ] 通过了所有测试
```

### 代码审查

- 耐心等待维护者审查
- 积极回应审查意见
- 根据反馈进行修改
- 保持友好和专业

---

## 问题反馈

### 创建 Issue

**Bug 报告模板：**

```markdown
## Bug 描述

清晰简洁地描述 Bug。

## 复现步骤

1. 进入 '...'
2. 点击 '...'
3. 滚动到 '...'
4. 出现错误

## 期望行为

描述你期望发生什么。

## 实际行为

描述实际发生了什么。

## 截图

如果适用，添加截图。

## 环境

- 操作系统: [例如 Windows 11]
- 浏览器: [例如 Chrome 120]
- Node.js 版本: [例如 18.17.0]
- 项目版本: [例如 1.0.0]

## 额外信息

添加其他相关信息。
```

**功能请求模板：**

```markdown
## 功能描述

清晰简洁地描述你想要的功能。

## 问题场景

描述这个功能可以解决什么问题。

## 期望的解决方案

描述你希望如何实现这个功能。

## 替代方案

描述你考虑过的其他方案。

## 额外信息

添加其他相关信息、截图或示例。
```

---

## 开发工具推荐

### VS Code 扩展

- **ESLint** - 代码检查
- **Prettier** - 代码格式化
- **Tailwind CSS IntelliSense** - Tailwind 类名提示
- **TypeScript Error Translator** - TypeScript 错误翻译
- **GitLens** - Git 增强
- **Auto Rename Tag** - 标签自动重命名

### 配置建议

`.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["className=\"([^\"]*)", "([^\"]*)"]]
  ]
}
```

---

## 获取帮助

如有任何问题，可以通过以下方式寻求帮助：

- 💬 **GitHub Discussions**: 参与讨论和提问
- 📧 **邮件**: contact@lovesongs.ai
- 💬 **微信群**: 扫码加入开发者交流群

---

## 致谢

感谢所有贡献者！你们的付出让这个项目变得更好。❤️

### 贡献者名单

查看 [贡献者列表](https://github.com/lovesongs-ai/graphs/contributors)

---

<div align="center">

**再次感谢你的贡献！** 🎵💕

[返回首页](README.md)

</div>
