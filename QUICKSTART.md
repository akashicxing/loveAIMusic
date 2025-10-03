# 快速开始指南

本指南帮助你在 5 分钟内启动项目。

---

## ⚡ 超快速启动

```bash
# 1. 克隆项目
git clone https://github.com/your-username/lovesongs-ai.git
cd lovesongs-ai

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 🎉

---

## 📋 快速命令

```bash
# 开发
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run start        # 启动生产服务器

# 检查
npm run typecheck    # TypeScript 类型检查
npm run lint         # ESLint 代码检查

# 清理
rm -rf .next         # 清理构建缓存
rm -rf node_modules  # 删除依赖
npm install          # 重新安装
```

---

## 🎯 主要功能位置

| 功能 | 文件路径 |
|------|---------|
| 首页 | `app/page.tsx` |
| 创作工具 | `app/create/page.tsx` |
| 我的作品 | `app/my-works/page.tsx` |
| 关于我们 | `app/about/page.tsx` |
| 导航栏 | `components/Navigation.tsx` |
| 音乐展示 | `components/MusicShowcase.tsx` |

---

## 🔧 快速定制

### 修改品牌信息

编辑 `components/Navigation.tsx`:

```tsx
<span className="text-xl font-bold text-gradient">
  你的品牌名称
</span>
```

### 修改音乐风格

编辑 `public/data/musicStyles.json`:

```json
{
  "id": "your-style",
  "name": "风格名称",
  ...
}
```

### 修改问答题目

编辑 `data/round1.json` 和 `data/round2.json`

### 替换团队照片

编辑 `app/about/page.tsx` 中的 `teamMembers` 数组

### 替换二维码

编辑 `app/about/page.tsx` 中的 `socialLinks` 数组

---

## 🚀 部署

### Vercel (推荐)

1. 推送代码到 GitHub
2. 访问 [vercel.com](https://vercel.com)
3. 导入项目
4. 自动部署完成！

### 其他平台

```bash
# 构建
npm run build

# 运行
npm run start
```

---

## 📚 更多文档

- 📖 [完整文档](README.md) - 详细的项目介绍
- 💻 [开发指南](DEVELOPMENT.md) - 开发相关说明
- 🤝 [贡献指南](CONTRIBUTING.md) - 如何贡献代码
- 📝 [更新日志](CHANGELOG.md) - 版本更新记录

---

## ❓ 常见问题

**Q: 启动失败？**
```bash
# 删除依赖重新安装
rm -rf node_modules package-lock.json
npm install
```

**Q: 构建错误？**
```bash
# 检查类型错误
npm run typecheck
```

**Q: 样式不生效？**
- 检查 Tailwind 配置
- 清除 `.next` 缓存

---

## 💬 获取帮助

- 📧 邮箱: contact@lovesongs.ai
- 💬 GitHub Issues
- 📱 微信群

---

**准备好了吗？开始创作吧！** 🎵💕
