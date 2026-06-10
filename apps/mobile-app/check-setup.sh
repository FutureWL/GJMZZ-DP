#!/bin/bash

echo "🔍 验证 Mobile App 项目设置..."
echo

# 检查关键文件
echo "1. 检查关键文件..."
files=(
  "package.json"
  "tsconfig.json"
  "vite.config.ts"
  "capacitor.config.ts"
  "tailwind.config.js"
  "src/main.tsx"
  "src/app/App.tsx"
  "android/build.gradle"
  "android/app/build.gradle"
)

all_exist=true
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file (缺失)"
    all_exist=false
  fi
done

echo

# 检查依赖安装
echo "2. 检查依赖..."
if [ -d "node_modules" ]; then
  echo "  ✅ node_modules 已安装"
else
  echo "  ⚠️  node_modules 未安装，运行: pnpm install"
fi

# 检查构建输出
echo
echo "3. 检查构建输出..."
if [ -d "dist" ]; then
  echo "  ✅ dist 目录存在"
  if [ -f "dist/index.html" ]; then
    echo "  ✅ Web 资源已构建"
  else
    echo "  ⚠️  Web 资源未构建，运行: pnpm build"
  fi
else
  echo "  ⚠️  dist 目录不存在，运行: pnpm build"
fi

# 检查 Android 项目
echo
echo "4. 检查 Android 项目..."
if [ -d "android" ]; then
  echo "  ✅ Android 项目已创建"
  if [ -f "android/app/build.gradle" ]; then
    echo "  ✅ Android build.gradle 存在"
  fi
else
  echo "  ❌ Android 项目未创建"
fi

echo
echo "📋 后续步骤:"
echo "  1. 在 Android Studio 中打开: apps/mobile-app/android"
echo "  2. 连接 Android 设备或启动模拟器"
echo "  3. 运行 'pnpm android:sync' 同步最新 Web 资源"
echo "  4. 在 Android Studio 中点击 Run 按钮"
echo
echo "🎉 项目设置验证完成!"
