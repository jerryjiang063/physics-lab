# 构建说明

## 常见构建问题

### 1. esbuild 服务崩溃（CSS 处理）

如果遇到 `[vite:css-post] The service is no longer running` 错误：

**已优化配置：**
- ✅ 禁用了 CSS 压缩（`cssMinify: false`）以减少内存压力
- ✅ 禁用了 CSS 代码分割（`cssCodeSplit: false`）以减少处理复杂度
- ✅ 优化了 esbuild 配置以减少内存使用

**如果问题仍然存在：**
- 检查服务器内存是否充足（建议至少 2GB 可用内存）
- 尝试增加 Node.js 内存限制：`NODE_OPTIONS="--max-old-space-size=4096" npm run build`

### 2. 跨平台构建问题

如果遇到 esbuild 平台错误（Windows → Linux），请确保：

### 在服务器上重新安装依赖

**不要在本地复制 `node_modules` 到服务器！**

正确的部署流程：

1. **只复制源代码和配置文件**（不包括 `node_modules`）
   ```bash
   # .gitignore 已经排除了 node_modules
   git clone <repo>
   # 或
   rsync -av --exclude 'node_modules' ./ server:/opt/apps/physics/
   ```

2. **在服务器上安装依赖**
   ```bash
   cd /opt/apps/physics
   npm ci
   # 或
   npm install
   ```

3. **构建**
   ```bash
   npm run build
   ```

### Docker 部署

如果使用 Docker，确保在 Dockerfile 中：

```dockerfile
FROM node:18-alpine

WORKDIR /app

# 先复制 package.json
COPY package*.json ./

# 在容器内安装依赖（Linux 平台）
RUN npm ci

# 然后复制源代码
COPY . .

# 构建
RUN npm run build
```

### CI/CD 配置

确保 CI/CD 流程中：
- ✅ 运行 `npm ci` 或 `npm install` 在目标平台上
- ❌ 不要复制本地的 `node_modules` 目录

