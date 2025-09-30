# NoteMemo - 极简笔记备忘录

> © 2025 [MaydayV](https://github.com/MaydayV) - 极简卡片笔记网页版

一个基于 Next.js 的极简笔记备忘录应用，采用黑白极简设计风格，支持快速搜索和分类管理。

## 应用截图

| 登录页面 | 笔记列表页面 | 笔记详情页面 |
|:-------:|:----------:|:---------:|
| ![登录页面](/public/Loginpage.png) | ![笔记列表页面](/public/Listpage.png) | ![笔记详情页面](/public/NoteDetails.png) |

## 功能特性

- ✅ **六位数字访问验证** - 通过环境变量设置访问码
- ✅ **极简黑白设计** - 简洁优雅的用户界面
- ✅ **卡片式笔记展示** - 清晰的卡片布局
- ✅ **快速搜索功能** - 支持标题、内容、分类和标签搜索
- ✅ **分类筛选** - 按分类快速筛选笔记
- ✅ **本地存储** - 无需数据库也可使用（基本功能）
- ✅ **响应式设计** - 适配各种设备屏幕
- ✅ **键盘快捷键** - Cmd/Ctrl + K 快速聚焦搜索
- ✅ **PWA 支持** - 支持添加到主屏幕，离线访问
- ✅ **多设备同步** - 支持MongoDB数据库同步笔记内容
- ✅ **多用户支持** - 通过多个访问码区分不同用户
- ✅ **冲突解决机制** - 基于时间戳的数据同步冲突解决

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

5. 最新部署版本可访问：[https://notememo.vercel.app](https://notememo.vercel.app)

## 多设备同步功能

NoteMemo 现在支持多设备同步功能，可以通过 MongoDB 数据库在不同设备间同步笔记内容。

### 配置多设备同步

1. 在 Vercel 项目中安装 MongoDB Atlas 集成：
   - 进入 Vercel 项目 > Storage 选项卡
   - 选择 MongoDB Atlas 并完成连接配置
   - **重要**：在配置过程中，如果要求填写数据库名称，请输入 `notememo`（全部小写）
   - Vercel 会自动为您的项目添加 `MONGODB_URI` 环境变量

2. 启用同步功能：
   - 进入项目 Settings > Environment Variables
   - 添加变量名：`ENABLE_SYNC`
   - 值：`true`
   - 确保选中所有环境（Production, Preview, Development）

3. 重新部署项目以应用更改

### 多用户支持

NoteMemo 支持多个用户通过不同的访问码访问自己的笔记。

1. 配置多个访问码：
   - 进入项目 Settings > Environment Variables
   - 添加变量名：`ACCESS_CODES`
   - 值：多个访问码，用逗号分隔（如：`123456,654321,111111`）
   - 确保选中所有环境（Production, Preview, Development）

2. 每个访问码对应一个独立的用户，拥有自己的笔记和分类

### 访问码优先级

系统按以下优先级检查访问码：

1. `ACCESS_CODES` 环境变量（支持多用户）
2. `NEXT_PUBLIC_ACCESS_CODE` 或 `ACCESS_CODE` 环境变量（单用户）
3. 开发环境下默认访问码 `123456`（仅在开发环境有效）

### 数据同步冲突解决

NoteMemo 实现了基于时间戳的数据同步冲突解决机制，确保多设备同时编辑时数据的一致性。

1. **设备识别**：
   - 每个设备会生成一个唯一的设备ID
   - 设备ID存储在本地，用于跟踪同步状态

2. **时间戳比较**：
   - 每次编辑笔记时会更新时间戳
   - 同步时会比较本地和服务器的时间戳
   - 保留最新的版本，确保不会丢失最新的编辑

3. **增量同步**：
   - 只同步自上次同步以来变更的数据
   - 减少数据传输量，提高同步效率

4. **冲突处理策略**：
   - 当本地和服务器版本冲突时，以更新时间较新的版本为准
   - 对于笔记，逐条比较并合并
   - 对于分类，服务器版本优先

## 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **构建工具**: Turbopack
- **部署**: Vercel
- **PWA**: next-pwa
- **数据库**: MongoDB Atlas

## 项目结构

```
src/
├── app/
│   ├── api/
│   │   ├── notes/
│   │   │   └── route.ts        # 笔记API路由
│   │   ├── categories/
│   │   │   └── route.ts        # 分类API路由
│   │   └── sync/
│   │       └── route.ts        # 同步API路由
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
│   ├── SyncStatus.tsx     # 同步状态显示组件
│   ├── PWAInitializer.tsx # PWA初始化组件
│   └── MarkdownRenderer.tsx # Markdown 渲染组件
├── lib/
│   ├── auth.ts           # 认证工具函数
│   ├── db.ts            # 数据库连接与操作
│   └── notes.ts          # 笔记数据处理
└── types/
    ├── note.ts           # 笔记相关类型定义
    └── next-pwa.d.ts     # PWA 类型声明
```

## 使用说明

### 笔记管理

笔记数据可以存储在浏览器的本地存储或MongoDB数据库中，包含以下信息：
- 标题
- 内容（支持 Markdown 格式）
- 分类
- 标签
- 创建和更新时间

### 搜索功能

- 支持搜索笔记标题、内容、分类和标签
- 使用 `Cmd/Ctrl + K` 快捷键快速聚焦搜索框
- 搜索结果实时显示，无需按回车

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

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `ACCESS_CODE` | 6位数字访问码，用于登录验证 | `123456` |
| `NEXT_PUBLIC_ACCESS_CODE` | 与ACCESS_CODE功能相同，兼容旧版本 | `123456` |
| `ACCESS_CODES` | 多个访问码，用逗号分隔 | `123456,654321,111111` |
| `ENABLE_SYNC` | 是否启用多设备同步 | `true` 或 `false` |
| `MONGODB_URI` | MongoDB连接字符串 | `mongodb+srv://...` |

> **注意**：
> 1. 在 Vercel 部署时，请直接在 Vercel 界面中添加环境变量，不要使用引用语法（如 `@access_code`）
> 2. 如果启用多设备同步，数据库名称必须设置为 `notememo`（全部小写）

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
