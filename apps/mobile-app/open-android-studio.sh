#!/bin/bash

# 打开 Android Studio 并导入 mobile-app Android 项目

ANDROID_STUDIO="/home/weilai/.local/share/JetBrains/Toolbox/apps/android-studio/bin/studio.sh"
PROJECT_PATH="/home/weilai/CodeProjects/GJMZZ-DP/apps/mobile-app/android"

echo "🚀 启动 Android Studio..."
echo "📂 项目路径: $PROJECT_PATH"

# 启动 Android Studio 并打开项目
"$ANDROID_STUDIO" "$PROJECT_PATH" &

echo "✅ Android Studio 已启动"
echo "📝 提示：首次打开可能需要配置 Android SDK"
