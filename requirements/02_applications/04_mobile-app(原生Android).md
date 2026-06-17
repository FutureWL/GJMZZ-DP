# 04 mobile-app(原生 Android)

> 路径:`apps/mobile-app/`
> 端口:开发期 vite 5181;容器化后主机 33715(nginx)
> 角色:Android 安装包,Capacitor 包装,使用设备能力(后续)

## 1. 技术栈

- React 19.2 + Vite 8(开发端口 5181)
- TypeScript ~6.0.2
- React Router v7
- **@capacitor/{core@7,cli@7,android@8,browser@8}**
- @tanstack/react-query 5.60(数据请求/缓存)
- zustand 5(状态)
- date-fns 4(日期)
- keycloak-js 26.0.5(SSO)
- lucide-react

> 与 `mobile-portal-ui` 区别:**集成 Capacitor,可调用设备能力(扫码/相机/推送)**;数据流偏 React Query,不再直接依赖 mock 包(本期不引入 `@factory/mock-data`)。

## 2. 目录结构

```
apps/mobile-app/
├── capacitor.config.ts
├── Dockerfile
├── nginx.conf
├── android/                      # Capacitor 生成的原生工程
├── public/
├── src/
│   ├── main.tsx
│   ├── index.css
│   ├── vite-env.d.ts
│   └── app/
│       ├── App.tsx
│       ├── routes/
│       ├── pages/
│       │   ├── auth/
│       │   └── dashboard/
│       ├── components/
│       └── state/
├── DEPLOYMENT.md
├── PROJECT_STATUS.md
├── README.md
├── TROUBLESHOOTING.md
├── check-setup.sh
├── open-android-studio.sh
└── package.json
```

## 3. 关键脚本

```bash
pnpm -C apps/mobile-app dev                  # Vite 5181
pnpm -C apps/mobile-app build                # 出 web 资产
pnpm -C apps/mobile-app android:init         # 首次生成 android 工程
pnpm -C apps/mobile-app android:sync         # 同步 web 资产到 android
pnpm -C apps/mobile-app android:open         # 打开 Android Studio
```

APK 产物路径:`apps/mobile-app/android/app/build/outputs/apk/debug/app-debug.apk`。

## 4. Capacitor 关键配置

`capacitor.config.ts` 主要字段:
- `appId`(反向域,如 `com.factory.mobile`)
- `appName`
- `webDir`(构建产物目录,如 `dist`)
- `server`(开发期可指 `url` + `cleartext`,生产期留空走 `https://localhost/`)
- `androidScheme`(默认 `https`,与 `localhost` 配合)

## 5. 已知问题

- **APK 启动白屏**(详见 `06_runtime/02_常见问题与故障.md`)
  - 假设:assets/public 缺失/路径错、JS 报错、Keycloak 回调阻塞、原生层异常
  - 取证:adb logcat + chrome://inspect
  - 详见仓库根 `debug-apk-white-screen.md`
- **开发期跨域**:`factory-api` 已 `enableCors({ origin: true, credentials: true })`,可解
- **HTTPS 证书**:`android:scheme=https` 走 `https://localhost/` 加载本地资源,需确保 `assets/public` 完整

## 6. 与其他 App 的关系

| App | 关系 |
|---|---|
| portal-ui | 共享业务模型思路(都看 mock),但**不直接共享包**;mobile-app 走 React Query + zustand |
| mobile-portal-ui | 互补:H5 vs 原生。后续可考虑 mobile-app 内嵌 mobile-portal-ui 业务页(`server.url` 指向) |
| factory-api | 移动端 API 网关 |

## 7. 待办

- [ ] 解决白屏(见故障库)
- [ ] 集成 @capacitor/{camera,barcode-scanner,push-notifications}
- [ ] iOS 端(本期不做)
