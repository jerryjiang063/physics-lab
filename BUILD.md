# 构建说明

## 常见构建问题

### 1. esbuild 服务崩溃

如果遇到以下错误：
- `[vite:css-post] The service is no longer running` (CSS 处理)
- `[commonjs--resolver] The service is no longer running` (CommonJS 依赖，如 recharts)
- `[vite:esbuild-transpile] The service is no longer running` (转译阶段)

**已采用稳妥方案：**
- ✅ **使用 terser 而不是 esbuild 进行压缩**：`minify: 'terser'` - 更稳定，避免 esbuild 崩溃
- ✅ 禁用了 CSS 压缩（`cssMinify: false`）以减少内存压力
- ✅ 禁用了 CSS 代码分割（`cssCodeSplit: false`）以减少处理复杂度
- ✅ 禁用了 source maps（`sourcemap: false`）以减少内存使用
- ✅ 简化了 esbuild 配置，只处理 JSX，其他由 TypeScript 编译器处理
- ✅ 优化了 CommonJS 处理（`commonjsOptions`）以更好地处理 recharts 等依赖
- ✅ 简化了依赖预构建配置，不强制预构建

**关键改进：**
- 使用 `terser` 进行代码压缩，而不是 esbuild，避免 esbuild 服务崩溃
- 简化了构建流程，减少并行处理，提高稳定性
- 已安装 `terser` 作为依赖

**如果问题仍然存在：**
- 检查服务器内存是否充足（建议至少 2GB 可用内存）
- 尝试增加 Node.js 内存限制：`NODE_OPTIONS="--max-old-space-size=4096" npm run build`
- 确保在服务器上重新安装依赖（不要复制 Windows 的 node_modules）
- 确保已安装 terser：`npm install --save-dev terser`

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

