# 变更日志

## 2025-09-29 - 多设备同步与多用户支持

### 新增功能

1. **MongoDB 数据库集成**
   - 添加了 MongoDB Atlas 数据库支持
   - 使用 Vercel Functions 的数据库连接池管理
   - 创建了数据库连接和操作的工具函数

2. **多设备同步功能**
   - 通过环境变量 `ENABLE_SYNC=true` 启用同步
   - 在本地存储的基础上增加了数据库同步
   - 支持笔记和分类的多设备同步
   - 添加了同步状态检查的 API 路由

3. **多用户支持**
   - 支持通过 `ACCESS_CODES` 环境变量配置多个访问码
   - 每个访问码对应一个独立用户
   - 用户数据相互隔离，不会互相影响
   - 保存当前用户的访问码以便后续操作

### 修改的文件

- `src/lib/db.ts` (新增) - 数据库连接和操作
- `src/lib/auth.ts` - 增加多访问码验证支持
- `src/lib/notes.ts` - 添加数据库同步功能
- `src/components/LoginForm.tsx` - 更新以支持异步验证和多用户
- `src/app/api/sync/route.ts` (新增) - 同步状态检查 API
- `README.md` - 更新文档，添加多设备同步和多用户配置说明

### 配置说明

1. **启用多设备同步**
   ```
   ENABLE_SYNC=true
   ```

2. **配置多个访问码**
   ```
   ACCESS_CODES=123456,654321,111111
   ```

3. **MongoDB 连接**
   通过 Vercel 项目的 Storage 选项卡添加 MongoDB Atlas 集成，会自动配置 `MONGODB_URI`。 