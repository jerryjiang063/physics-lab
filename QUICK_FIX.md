# 快速修复指南：esbuild 跨平台错误

## 问题

```
You installed esbuild for another platform than the one you're currently using.
```

## 原因

服务器上的 `node_modules` 包含 Windows 版本的 esbuild，但服务器是 Linux。

**重要：即使使用 terser 压缩，Vite 仍然需要 esbuild 来：**
- 加载 `vite.config.ts` 配置文件
- 执行 JSX 转译
- 处理依赖预构建

## 快速修复（3 步）

在服务器上执行：

```bash
cd /opt/apps/physics

# 1. 删除旧的 node_modules（Windows 版本）
rm -rf node_modules

# 2. 重新安装依赖（会安装 Linux 版本的 esbuild）
npm install

# 3. 构建
npm run build
```

## 验证

安装后检查 esbuild：

```bash
ls -la node_modules/esbuild/bin/
# 应该看到 esbuild 二进制文件（Linux 版本）
```

## 预防措施

**永远不要：**
- ❌ 复制 Windows 的 `node_modules` 到 Linux 服务器
- ❌ 使用 `scp` 或 `rsync` 复制整个项目（包括 node_modules）

**应该：**
- ✅ 只复制源代码（`.gitignore` 已排除 `node_modules`）
- ✅ 在服务器上运行 `npm install` 或 `npm ci`
- ✅ 使用 Git 部署（推荐）

## 使用部署脚本

项目包含 `deploy.sh` 脚本，自动处理这些步骤：

```bash
cd /opt/apps/physics
chmod +x deploy.sh
./deploy.sh
```

