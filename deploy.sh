#!/bin/bash
# 服务器部署脚本示例
# 确保在 Linux 服务器上运行此脚本

set -e

echo "🚀 Starting deployment..."

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# 检查平台
echo "🔍 Checking platform..."
PLATFORM=$(uname -s)
ARCH=$(uname -m)
echo "Platform: $PLATFORM $ARCH"

if [ "$PLATFORM" != "Linux" ]; then
    echo "⚠️  Warning: This script is designed for Linux. Current platform: $PLATFORM"
fi

# 清理旧的 node_modules（如果存在）
if [ -d "node_modules" ]; then
    echo "🧹 Cleaning old node_modules (this is CRITICAL for cross-platform builds)..."
    rm -rf node_modules
    echo "✅ Old node_modules removed"
fi

# 清理 package-lock.json（可选，确保全新安装）
if [ -f "package-lock.json" ]; then
    echo "🧹 Cleaning package-lock.json for fresh install..."
    rm -f package-lock.json
fi

# 安装依赖（在目标平台上 - 这会安装正确的 esbuild 版本）
echo "📦 Installing dependencies on target platform ($PLATFORM $ARCH)..."
echo "   This will install the correct esbuild binary for this platform."
npm install

# 验证 esbuild 版本
echo "🔍 Verifying esbuild installation..."
if [ -d "node_modules/esbuild" ]; then
    echo "✅ esbuild installed"
    # 检查 esbuild 二进制文件
    if [ -f "node_modules/esbuild/bin/esbuild" ]; then
        echo "✅ esbuild binary found"
        file node_modules/esbuild/bin/esbuild || true
    fi
else
    echo "❌ Error: esbuild not found after installation"
    exit 1
fi

# 构建项目
echo "🔨 Building project..."
npm run build

echo "✅ Build completed successfully!"
echo "📁 Output files are in the 'dist' directory"

