# NoteMemo Vercel 部署指南

本指南将帮助您在 Vercel 平台上成功部署 NoteMemo 应用，并配置所有必要的环境变量和数据库连接。

## 1. 准备工作

确保您已经：

- 拥有一个 [Vercel](https://vercel.com) 账号
- 将 NoteMemo 代码推送到 GitHub 仓库
- 准备好 MongoDB Atlas 账号（如需多设备同步功能）

## 2. 导入项目到 Vercel

1. 登录 Vercel 平台
2. 点击 "Add New..." > "Project"
3. 选择包含 NoteMemo 代码的 GitHub 仓库
4. 点击 "Import"

## 3. 配置项目

### 基本配置

保持默认配置即可，Vercel 会自动检测这是一个 Next.js 项目。

### 环境变量配置

在部署之前，点击 "Environment Variables" 部分，添加以下环境变量：

#### 必需的环境变量

| 变量名 | 描述 | 示例值 |
|--------|------|--------|
| `ACCESS_CODES` | 多个访问码，用逗号分隔 | `123456,654321,111111` |
| `ACCESS_CODE` | 单个访问码（如果不使用多用户功能） | `123456` |

#### 多设备同步功能（可选）

如果需要启用多设备同步功能，添加以下环境变量：

| 变量名 | 描述 | 示例值 |
|--------|------|--------|
| `ENABLE_SYNC` | 是否启用同步功能 | `true` |

确保为所有环境（Production、Preview 和 Development）启用这些环境变量。

## 4. 配置 MongoDB 数据库（可选，用于多设备同步）

如果您需要多设备同步功能，需要配置 MongoDB 数据库：

1. 在 Vercel 项目页面中，点击 "Storage" 选项卡
2. 选择 "Connect Database" > "MongoDB Atlas"
3. 按照向导完成 MongoDB Atlas 的连接配置
4. **重要**：在配置过程中，如果要求填写数据库名称，请输入 `notememo`（全部小写）
5. 这个数据库名必须与代码中定义的名称匹配（在 `src/lib/db.ts` 文件中定义为 `notememo`）
6. Vercel 会自动为您的项目添加 `MONGODB_URI` 环境变量

### MongoDB 数据库名称说明

NoteMemo 项目在代码中已经将数据库名称硬编码为 `notememo`。这个名称在 `src/lib/db.ts` 文件中定义：

```javascript
// 数据库连接信息
const DB_NAME = 'notememo';  // 数据库名称
```

因此，在 Vercel 配置 MongoDB Atlas 集成时，如果要求指定数据库名称，必须使用 `notememo`，否则应用将无法正确连接到数据库。

## 5. 部署项目

1. 完成所有配置后，点击 "Deploy" 按钮
2. 等待部署完成
3. 部署成功后，您可以通过分配的域名访问您的 NoteMemo 应用

## 6. 验证部署

1. 访问您的 NoteMemo 应用
2. 使用您配置的访问码登录
3. 确认所有功能正常工作

## 7. 常见问题排查

### 访问码无法验证

- 确认环境变量 `ACCESS_CODES` 或 `ACCESS_CODE` 已正确配置
- 检查访问码是否包含空格或特殊字符

### 多设备同步不工作

- 确认 `ENABLE_SYNC` 环境变量设置为 `true`
- 确认 MongoDB Atlas 已正确连接
- 检查数据库名称是否正确设置为 `notememo`
- 检查 Vercel 日志中是否有数据库连接错误

### 部署失败

- 检查 Vercel 构建日志中的错误信息
- 确认所有依赖项都已正确安装

## 8. 自定义域名（可选）

1. 在 Vercel 项目页面中，点击 "Settings" > "Domains"
2. 添加您的自定义域名
3. 按照 Vercel 提供的说明配置 DNS 记录

## 9. 更新部署

每次将更改推送到 GitHub 仓库的主分支时，Vercel 会自动重新部署您的应用。

---

如有任何问题，请参考 [Vercel 文档](https://vercel.com/docs) 或提交 GitHub Issue。 