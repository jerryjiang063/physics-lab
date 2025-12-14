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

# 清理旧的 node_modules（如果存在）
if [ -d "node_modules" ]; then
    echo "🧹 Cleaning old node_modules..."
    rm -rf node_modules
fi

# 安装依赖（在目标平台上）
echo "📦 Installing dependencies on target platform..."
npm ci

# 构建项目
echo "🔨 Building project..."
npm run build

echo "✅ Build completed successfully!"
echo "📁 Output files are in the 'dist' directory"

