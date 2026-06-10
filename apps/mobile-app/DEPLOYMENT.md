# 工厂移动App - 部署指南

## 访问地址

### 生产环境（Docker）
- **直接访问**: http://localhost:33715/m/app/
- **通过网关**: http://localhost:33700/m/app/

### 开发环境
```bash
cd apps/mobile-app
pnpm dev
# 访问: http://localhost:5181/m/app/
```

---

## 架构说明

### 端口分配（33700系列）
- **33700**: Gateway (Nginx)
- **33701**: Portal UI
- **33702**: Mobile Portal UI (轻量级PWA)
- **33703**: Cockpit UI
- **33704**: Factory API
- **33705**: PostgreSQL
- **33706**: CloudBeaver
- **33707**: Redis
- **33708-33709**: RabbitMQ
- **33710-33711**: MinIO
- **33712-33714**: TDengine
- **33715**: Mobile App (全功能原生App) ⭐ 新增

### 网关路由配置

```nginx
# gateway.conf
location ^~ /m/app/ {
    proxy_pass http://mobile_app;
}
```

---

## 快速启动

### 方式1: 使用 Docker（推荐用于测试）

```bash
# 1. 启动所有服务
docker compose up -d

# 2. 访问应用
open http://localhost:33700/m/app/

# 3. 查看日志
docker compose logs -f mobile-app
```

### 方式2: 本地开发

```bash
# 1. 启动开发服务器
cd apps/mobile-app
pnpm dev

# 2. 访问应用
open http://localhost:5181/m/app/

# 3. 登录测试
# 用户名: demo
# 密码: demo
```

---

## 构建和部署

### 构建 Docker 镜像

```bash
# 构建 mobile-app 镜像
docker compose build mobile-app

# 或者直接构建
docker build -f apps/mobile-app/Dockerfile -t factory-mobile-app:latest .
```

### 同步 Capacitor 到 Android

```bash
cd apps/mobile-app

# 1. 重新构建 Web 资源
pnpm build

# 2. 同步到 Android 项目
npx cap sync android

# 3. 在 Android Studio 中打开
npx cap open android
```

### 生成 Debug APK

```bash
cd apps/mobile-app/android
./gradlew assembleDebug

# APK 位置: apps/mobile-app/android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Keycloak 配置

### 客户端设置

已在 Keycloak 中配置 `mobile-app` 客户端：

- **Client ID**: `mobile-app`
- **Protocol**: OpenID Connect
- **Access Type**: Public
- **Valid Redirect URIs**:
  - `http://localhost:33700/m/app/*`
  - `http://localhost:33715/*`
  - `http://localhost:33715/m/app/*`
  - `http://localhost:5181/*`
  - `http://localhost:5182/*`
  - `http://localhost:5183/*`

### 测试账号

- **用户名**: `demo`
- **密码**: `demo`

---

## 环境变量

创建 `.env` 文件（可选，用于本地开发）:

```env
VITE_KEYCLOAK_URL=http://sso.corp.aygjm.lan:18080
VITE_KEYCLOAK_REALM=factory-platform
VITE_KEYCLOAK_CLIENT_ID=mobile-app
```

---

## 常见问题

### 问题1: Docker 容器启动失败

```bash
# 检查 mobile-app 服务状态
docker compose ps mobile-app

# 查看详细日志
docker compose logs mobile-app

# 如果需要重建
docker compose up -d --build mobile-app
```

### 问题2: Keycloak 重定向错误

```bash
# 重新导入 Keycloak 配置
docker compose exec keycloak /opt/keycloak/bin/kc.sh import \
  --file /opt/keycloak/data/import/factory-platform-realm.json

# 重启 Keycloak
docker compose restart keycloak
```

### 问题3: 端口被占用

如果 33715 端口被占用，可以在 `docker-compose.yml` 中修改：

```yaml
mobile-app:
  ports:
    - "33720:80"  # 改为 33720
```

同时更新 Keycloak 的 redirect URIs。

---

## 性能指标

- **Web Bundle**: ~294 KB (gzipped: ~93 KB)
- **CSS**: ~12 KB (gzipped: ~3 KB)
- **总计**: ~307 KB (gzipped: ~97 KB)
- **Docker 镜像大小**: ~50-80 MB

---

## 下一步开发

1. **完善功能模块**
   - 审批中心
   - 任务管理
   - CRM 客户管理
   - 生产监控

2. **集成原生能力**
   - 推送通知 (Firebase)
   - 离线存储 (SQLite)
   - 相机和扫码
   - GPS 定位

3. **应用商店发布**
   - Android: Google Play
   - iOS: App Store

---

## 文档

- [项目状态报告](./PROJECT_STATUS.md)
- [故障排除指南](./TROUBLESHOOTING.md)
- [技术实施计划](../.trae/documents/全功能原生App模块实施计划.md)
