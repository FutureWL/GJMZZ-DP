[OPEN] APK 启动白屏（Android / Capacitor）

## 现象
- 安装 debug APK 后启动，进入纯白屏界面
- 预期：出现登录页或门户页

## 环境
- 设备：Android Emulator（用户截图：Medium Phone API 37.0）
- 构建：apps/mobile-app/android assembleDebug

## 假设（可证伪）
1. WebView 未能加载到 index.html（assets/public 缺失或路径不对），导致页面为空。
2. WebView 加载到了页面，但 JS 运行时报错（白屏），logcat 会出现 Chromium/JS error。
3. 路由 basename/路径不匹配（Web 版本用 /m/app/，Android 内部是 https://localhost/），导致路由命中不到任何页面。
4. Keycloak/OIDC 回调或初始化流程阻塞（例如等待 silent SSO/网络超时），但 UI 未渲染或被遮挡。
5. 原生层异常（Activity/Bridge 初始化失败），logcat 会有 FATAL EXCEPTION 或 Capacitor 初始化错误。

## 取证计划
1. adb 获取包名与启动 Activity，确认应用正常启动。
2. 采集 logcat：过滤 Capacitor/Chromium/WebView/JS error 与应用包名。
3. 如果需要，启用 WebView 远程调试（chrome://inspect）确认实际 URL、Console 报错与 Network 状态。

## 证据
- 待补充

## 结论
- 待补充

## 修复
- 待补充

