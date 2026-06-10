# 工厂移动App (Mobile App)

全功能原生移动应用，基于 Capacitor + React 技术栈构建。

## 技术栈

- **框架**: React 19 + TypeScript
- **构建工具**: Vite
- **原生容器**: Capacitor 7
- **原生平台**: Android (iOS 即将支持)
- **样式**: Tailwind CSS
- **状态管理**: Zustand + TanStack Query
- **路由**: React Router 7
- **认证**: Keycloak SSO

## 项目结构

```
apps/mobile-app/
├── src/
│   ├── app/
│   │   ├── components/       # 可复用组件
│   │   │   └── ui/          # 基础 UI 组件
│   │   ├── pages/           # 页面组件
│   │   │   ├── auth/        # 认证相关页面
│   │   │   └── dashboard/   # 首页仪表盘
│   │   ├── routes/          # 路由配置
│   │   └── state/          # 状态管理
│   │       └── auth/        # 认证状态
│   ├── main.tsx            # 应用入口
│   └── index.css           # 全局样式
├── android/                # Android 原生项目
├── capacitor.config.ts     # Capacitor 配置
├── vite.config.ts          # Vite 配置
├── tailwind.config.js      # Tailwind 配置
└── package.json
```

## 快速开始

### 开发环境要求

- Node.js >= 18
- pnpm >= 8
- Android Studio (用于 Android 开发)
- Xcode (用于 iOS 开发，macOS only)

### 安装依赖

```bash
cd apps/mobile-app
pnpm install
```

### 开发

```bash
# 启动开发服务器
pnpm dev

# 构建 Web 资源
pnpm build

# 同步到 Android
pnpm android:sync

# 在 Android Studio 中打开项目
pnpm android:open
```

### Android 构建

```bash
# 同步 Web 资源到 Android
npx cap sync android

# 使用 Android Studio 构建 APK
# 或使用命令行：
cd android
./gradlew assembleDebug
```

APK 文件位置: `android/app/build/outputs/apk/debug/app-debug.apk`

## 功能模块

### 第一阶段：核心功能 (MVP)

- ✅ 认证模块（SSO 登录、Token 管理）
- 🔄 首页仪表盘（待办、告警、快捷入口）
- 📋 审批中心
- 📝 任务管理
- 🔔 消息通知

### 第二阶段：业务功能

- 👥 CRM 模块（客户、联系人、商机）
- 📦 订单管理
- 🏭 生产监控
- 🔧 设备管理
- 📊 库存查询

### 第三阶段：高级功能

- 📷 扫码功能
- 📍 位置服务
- 📤 离线支持
- 🖨️ 蓝牙打印
- 🔔 推送通知

## 原生能力

本应用支持以下原生能力（通过 Capacitor 插件）:

- 推送通知 (FCM / APNs)
- 相机和相册
- 地理位置
- 蓝牙
- 生物识别
- SQLite 本地数据库
- 文件系统访问
- Haptic 反馈

## 配置

### 环境变量

创建 `.env` 文件:

```env
VITE_KEYCLOAK_URL=http://sso.corp.aygjm.lan:18080
VITE_KEYCLOAK_REALM=factory-platform
VITE_KEYCLOAK_CLIENT_ID=mobile-app
```

### Capacitor 配置

编辑 `capacitor.config.ts`:

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.factory.mobile',
  appName: '工厂移动App',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
```

## 部署

### Android

1. 构建 Release APK:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

2. 签名 APK (需要 keystore)

3. 上传到 Google Play Console

### iOS

1. 使用 Xcode 打开 `ios` 目录
2. 配置签名证书
3. 构建 Archive
4. 上传到 App Store Connect

## 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

MIT License

## 联系方式

技术支持: support@factory.com
