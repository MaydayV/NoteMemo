# NoteMemo - 极简笔记备忘录

> © 2025 [MaydayV](https://github.com/MaydayV) - 极简卡片笔记网页版

一个基于 Next.js 的极简笔记备忘录应用，采用黑白极简设计风格，支持快速搜索和分类管理。

## 应用截图

### 登录页面

![登录页面](/public/Loginpage.png)

### 笔记列表页面

![笔记列表页面](/public/Listpage.png)

## 功能特性

- ✅ **六位数字访问验证** - 通过环境变量设置访问码
- ✅ **极简黑白设计** - 简洁优雅的用户界面
- ✅ **卡片式笔记展示** - 清晰的卡片布局
- ✅ **快速搜索功能** - 支持标题、内容、分类和标签搜索
- ✅ **分类筛选** - 按分类快速筛选笔记
- ✅ **数据同步** - 支持MongoDB数据库同步，跨设备访问
- ✅ **响应式设计** - 适配各种设备屏幕
- ✅ **键盘快捷键** - Cmd/Ctrl + K 快速聚焦搜索
- ✅ **PWA 支持** - 支持添加到主屏幕，离线访问

## 快速开始

### 本地开发

1. 克隆项目
```bash
git clone https://github.com/MaydayV/NoteMemo.git
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

4. 编辑 `.env.local` 文件，设置访问码和数据库配置
```env
# 必需 - 访问码
ACCESS_CODE=123456

# 可选 - MongoDB数据库同步
ENABLE_DB_SYNC=false
MONGODB_URI=mongodb+srv://your-connection-string
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
   - 进入项目 Settings > Environment Variables
   - 添加变量名：`ACCESS_CODE`
   - 值：你的6位数字访问码（如：`123456`）
   - 添加变量名：`ENABLE_DB_SYNC`（可选）
   - 值：`true` 或 `false`
   - 添加变量名：`MONGODB_URI`（如果启用数据库同步）
   - 值：MongoDB连接字符串
   - 确保选中所有环境（Production, Preview, Development）

4. 部署完成！

## 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **构建工具**: Turbopack
- **部署**: Vercel
- **数据库**: MongoDB Atlas
- **PWA**: next-pwa

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
│   ├── NoteModal.tsx      # 笔记详情模态框
│   ├── NoteForm.tsx       # 笔记编辑表单
│   ├── CategoryModal.tsx  # 分类管理模态框
│   ├── MarkdownRenderer.tsx # Markdown 渲染组件
│   └── PWAInitializer.tsx # PWA 初始化组件
├── lib/
│   ├── auth.ts           # 认证工具函数
│   ├── notes.ts          # 笔记数据处理
│   ├── db.ts             # 数据库操作函数
│   └── mongodb.ts        # MongoDB连接客户端
└── types/
    ├── note.ts           # 笔记相关类型定义
    └── next-pwa.d.ts     # PWA 类型声明
```

## 使用说明

### 笔记管理

笔记数据可以存储在浏览器的本地存储中或MongoDB数据库中（如果启用），包含以下信息：
- 标题
- 内容（支持 Markdown 格式）
- 分类
- 标签
- 创建和更新时间

### 数据同步

NoteMemo支持两种数据存储模式：

1. **本地存储模式**（默认）：
   - 笔记数据保存在浏览器的localStorage中
   - 数据仅在当前设备和浏览器中可用
   - 适合个人使用或不需要跨设备访问的场景

2. **数据库同步模式**：
   - 笔记数据同步到MongoDB数据库
   - 可以在不同设备和浏览器之间同步笔记
   - 需要设置`ENABLE_DB_SYNC=true`和有效的`MONGODB_URI`环境变量

要启用数据库同步，请按照以下步骤操作：

1. 在MongoDB Atlas创建一个免费数据库
2. 获取连接字符串
3. 在环境变量中设置`ENABLE_DB_SYNC=true`和`MONGODB_URI=你的连接字符串`

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

你可以通过分类管理功能添加、编辑或删除分类。

### 示例笔记

项目包含了一些示例笔记，包括：
- NoteMemo 项目介绍
- 笔记管理与分类方法
- Markdown 常见写法
- Git 常用命令

## 环境变量

| 变量名 | 说明 | 示例 | 必需 |
|--------|------|------|------|
| `ACCESS_CODE` | 6位数字访问码，用于登录验证 | `123456` | 是 |
| `ENABLE_DB_SYNC` | 是否启用MongoDB数据库同步 | `true` 或 `false` | 否 |
| `MONGODB_URI` | MongoDB连接字符串 | `mongodb+srv://...` | 仅当启用数据库同步时 |

> **注意**：在 Vercel 部署时，请直接在 Vercel 界面中添加环境变量，不要使用引用语法（如 `@access_code`）

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

# 生成 PWA 图标资源
npm run pwa-assets
```

## PWA 支持

NoteMemo 支持 PWA（渐进式 Web 应用）功能，允许用户将应用添加到主屏幕并离线使用。PWA 功能包括：

- 添加到主屏幕
- 离线访问
- 应用更新提示

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
