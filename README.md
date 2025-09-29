# NoteMemo - 极简笔记备忘录

> © 2025 [MaydayV](https://github.com/MaydayV) - 极简卡片笔记网页版

一个基于 Next.js 的极简笔记备忘录应用，采用黑白极简设计风格，支持快速搜索和分类管理。

## 应用截图

| 登录页面 | 笔记列表页面 | 笔记详情页面 |
|:-------:|:----------:|:----------:|
| ![登录页面](/public/Loginpage.png) | ![笔记列表页面](/public/Listpage.png) | ![笔记详情页面](/public/NoteDetails.png) |

## 功能特性

- ✅ **六位数字访问验证** - 通过环境变量设置访问码
- ✅ **极简黑白设计** - 简洁优雅的用户界面
- ✅ **卡片式笔记展示** - 清晰的卡片布局
- ✅ **快速搜索功能** - 支持标题、内容、分类和标签搜索
- ✅ **分类筛选** - 按分类快速筛选笔记
- ✅ **无数据库设计** - 使用本地存储，无需配置数据库
- ✅ **响应式设计** - 适配各种设备屏幕
- ✅ **键盘快捷键** - Cmd/Ctrl + K 快速聚焦搜索
- ✅ **PWA 支持** - 支持添加到主屏幕，离线访问
- ✅ **多设备同步** - 可选启用MongoDB Atlas实现多设备同步

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
   - 进入项目 Settings > Environment Variables
   - 添加变量名：`ACCESS_CODE`
   - 值：你的6位数字访问码（如：`123456`）
   - 确保选中所有环境（Production, Preview, Development）

4. 部署完成！

### 启用多设备同步（可选）

NoteMemo默认使用浏览器本地存储保存笔记数据。如需在多设备间同步笔记，可以启用MongoDB Atlas存储。

#### 方法一：使用Vercel原生集成（推荐）

1. 在Vercel控制台中添加MongoDB集成：
   - 登录Vercel控制台，进入你的NoteMemo项目
   - 点击"Storage"选项卡
   - 选择"Connect Database"
   - 选择"MongoDB Atlas"
   - 按照向导完成MongoDB Atlas账户连接

2. Vercel会自动为你的项目配置以下环境变量：
   - `MONGODB_URI`：MongoDB连接字符串

3. 重新部署项目

4. 在应用界面中启用同步：
   - 登录应用
   - 在搜索框下方找到"多设备同步"开关
   - 点击开关启用同步
   - 输入用户ID（用于区分不同用户的数据）
   - 确认启用

#### 方法二：手动配置MongoDB Atlas

1. 在MongoDB Atlas创建数据库：
   - 注册/登录 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - 创建一个新的免费集群（M0级别）
   - 设置数据库用户和密码
   - 配置网络访问（建议允许所有IP访问，或者至少包含Vercel的IP范围）
   - 获取连接字符串，格式如：`mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/notememo?retryWrites=true&w=majority`

2. 在Vercel项目设置中添加环境变量：
   - 进入项目 Settings > Environment Variables
   - 添加变量名：`MONGODB_URI`
   - 值：你的MongoDB连接字符串
   - 确保选中所有环境（Production, Preview, Development）

3. 重新部署项目

4. 在应用界面中启用同步功能

> **注意**：MongoDB Atlas提供免费层级（M0），可存储512MB数据，足够个人笔记使用。

## 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **构建工具**: Turbopack
- **部署**: Vercel
- **PWA**: next-pwa
- **存储**: 本地存储 + MongoDB Atlas（可选）

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
│   ├── SyncToggle.tsx     # 同步功能开关组件
│   └── PWAInitializer.tsx # PWA 初始化组件
├── lib/
│   ├── auth.ts           # 认证工具函数
│   ├── notes.ts          # 笔记数据处理
│   ├── settings.ts       # 应用设置管理
│   └── mongodb.ts        # MongoDB连接工具
└── types/
    ├── note.ts           # 笔记相关类型定义
    └── next-pwa.d.ts     # PWA 类型声明
```

## 使用说明

### 笔记管理

笔记数据存储在浏览器的本地存储中，包含以下信息：
- 标题
- 内容（支持 Markdown 格式）
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

你可以通过分类管理功能添加、编辑或删除分类。

### 多设备同步

- 默认情况下，笔记存储在本地浏览器中
- 可选启用MongoDB Atlas存储实现多设备同步
- 使用相同用户ID可在不同设备间同步笔记
- MongoDB Atlas免费层提供512MB存储空间，可存储约25万条简单笔记

### 示例笔记

项目包含了一些示例笔记，包括：
- NoteMemo 项目介绍
- 笔记管理与分类方法
- Markdown 常见写法
- Git 常用命令

## 环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `ACCESS_CODE` | 6位数字访问码，用于登录验证 | `123456` |
| `MONGODB_URI` | MongoDB Atlas连接字符串（可选） | `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/notememo?retryWrites=true&w=majority` |

> **注意**：在 Vercel 部署时，请直接在 Vercel 界面中添加环境变量，或使用Vercel的MongoDB Atlas原生集成自动配置

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

## MongoDB Atlas 使用说明

### 为什么选择 MongoDB Atlas

- **更大存储空间**：免费层提供512MB存储，比Vercel KV的30MB大得多
- **文档型数据库**：天然适合存储笔记这类半结构化数据
- **强大的查询能力**：支持复杂查询和索引
- **可扩展性**：随着应用增长可以轻松升级
- **Vercel原生集成**：一键配置，无需手动设置连接字符串

### 数据安全

- MongoDB Atlas提供自动备份功能
- 数据加密传输和存储
- 细粒度的访问控制

### 数据结构

NoteMemo在MongoDB中使用两个集合：
- `notes`：存储所有笔记
- `categories`：存储分类信息

每条数据都包含`userId`字段，确保不同用户的数据隔离。

### Vercel与MongoDB Atlas集成优化

本项目使用了Vercel推荐的MongoDB连接池管理，通过`@vercel/functions`包的`attachDatabasePool`函数优化了MongoDB连接，防止在无服务器环境中出现连接泄漏问题。这确保了：

- 数据库连接在函数暂停和恢复时得到妥善管理
- 改善性能
- 防止连接耗尽

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
