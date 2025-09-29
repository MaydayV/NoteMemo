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
- ✅ **多设备同步** - 可选启用Vercel KV存储实现多设备同步

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

NoteMemo默认使用浏览器本地存储保存笔记数据。如需在多设备间同步笔记，可以启用Vercel KV存储：

1. 在Vercel控制台创建KV数据库：
   - 登录Vercel控制台
   - 进入项目 → Storage
   - 点击"Create New" → 选择"KV"
   - 在Marketplace数据库提供商中选择"Redis"
   - 按照向导完成创建

2. 创建完成后，Vercel会自动为项目添加以下环境变量：
   - `KV_URL`
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN`

3. 重新部署项目

4. 在应用界面中启用同步：
   - 登录应用
   - 在搜索框下方找到"多设备同步"开关
   - 点击开关启用同步
   - 输入用户ID（用于区分不同用户的数据）
   - 确认启用

5. 在其他设备上使用相同的用户ID可同步笔记数据

> **注意**：多设备同步功能需要Vercel KV存储支持，这是一项付费服务，但有免费额度可供小型应用使用。

## 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **构建工具**: Turbopack
- **部署**: Vercel
- **PWA**: next-pwa
- **存储**: 本地存储 + Vercel KV（可选）

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
│   └── settings.ts       # 应用设置管理
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
- 可选启用Vercel KV存储实现多设备同步
- 使用相同用户ID可在不同设备间同步笔记

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
| `KV_URL` | Vercel KV数据库URL（可选） | `redis://...` |
| `KV_REST_API_URL` | Vercel KV REST API URL（可选） | `https://...` |
| `KV_REST_API_TOKEN` | Vercel KV API令牌（可选） | `vercel_kv_...` |
| `KV_REST_API_READ_ONLY_TOKEN` | Vercel KV只读令牌（可选） | `vercel_kv_...` |

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
