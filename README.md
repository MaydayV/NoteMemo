# NoteMemo - 极简笔记备忘录

一个基于 Next.js 的极简笔记备忘录应用，采用黑白极简设计风格，支持快速搜索和分类管理。

## 功能特性

- ✅ **六位数字访问验证** - 通过环境变量设置访问码
- ✅ **极简黑白设计** - 简洁优雅的用户界面
- ✅ **卡片式笔记展示** - 清晰的卡片布局
- ✅ **快速搜索功能** - 支持标题、内容、分类和标签搜索
- ✅ **分类筛选** - 按分类快速筛选笔记
- ✅ **无数据库设计** - 使用本地存储，无需配置数据库
- ✅ **响应式设计** - 适配各种设备屏幕
- ✅ **键盘快捷键** - Cmd/Ctrl + K 快速聚焦搜索

## 快速开始

### 本地开发

1. 克隆项目
```bash
git clone <repository-url>
cd NoteMemo
```

2. 安装依赖
```bash
npm install
```

3. 创建环境变量文件
```bash
cp .env.example .env.local
```

4. 编辑 `.env.local` 文件，设置6位访问码
```env
ACCESS_CODE=123456
```

5. 启动开发服务器
```bash
npm run dev
```

6. 打开浏览器访问 [http://localhost:3000](http://localhost:3000)

### Vercel 部署

1. 将项目推送到 GitHub

2. 在 [Vercel](https://vercel.com) 上导入 GitHub 仓库

3. 在 Vercel 项目设置中添加环境变量：
   - 变量名：`ACCESS_CODE`
   - 值：你的6位数字访问码（如：`123456`）

4. 部署完成！

## 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **构建工具**: Turbopack
- **部署**: Vercel

## 项目结构

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── AuthGuard.tsx      # 认证保护组件
│   ├── LoginForm.tsx      # 登录表单
│   ├── SearchBar.tsx      # 搜索栏
│   ├── NoteCard.tsx       # 笔记卡片
│   └── NoteModal.tsx      # 笔记详情模态框
├── lib/
│   ├── auth.ts           # 认证工具函数
│   └── notes.ts          # 笔记数据处理
└── types/
    └── note.ts           # TypeScript 类型定义
```

## 使用说明

### 笔记管理

笔记数据存储在浏览器的本地存储中，包含以下信息：
- 标题
- 内容（支持简单的 Markdown 格式）
- 分类
- 标签
- 创建和更新时间

### 搜索功能

- 支持搜索笔记标题、内容、分类和标签
- 使用 `Cmd/Ctrl + K` 快捷键快速聚焦搜索框
- 实时搜索，无需按回车

### 分类筛选

项目预设了几个分类：
- 命令行工具
- 软件教程
- 开发技巧
- 其他

### 示例笔记

项目包含了一些示例笔记，包括：
- Git 常用命令
- Docker 基础命令
- Next.js 部署到 Vercel

## 环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `ACCESS_CODE` | 6位数字访问码 | `123456` |

## 开发命令

```bash
# 开发环境
npm run dev

# 构建项目
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint
```

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
