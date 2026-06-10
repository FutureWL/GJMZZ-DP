# 工厂移动App - 认证问题故障排除

## 问题描述

用户可以登录 Keycloak，但登录完成后仍然显示登录页，无法跳转到首页。

## 已实施的修复

### 1. Keycloak 客户端配置
✅ 已在 Keycloak realm 配置中添加 `mobile-app` 客户端
- Client ID: `mobile-app`
- Valid Redirect URIs: `http://localhost:5181/*`

### 2. AuthContext 配置
✅ 添加了 `redirectUri` 参数到 Keycloak 初始化配置
✅ 添加了错误处理和调试日志

### 3. Android 配置
✅ 在 AndroidManifest.xml 中添加了 OAuth callback intent filter
✅ 支持 `http://localhost:5181` 和 `https://localhost:5181` 协议

### 4. 调试功能
✅ 在 ProtectedRoute 组件中添加了调试日志

---

## 如何调试

### 步骤 1: 检查浏览器控制台

在 Android Studio 中运行应用时，打开 Logcat 并搜索 `ProtectedRoute` 或 `Keycloak`：

```bash
adb logcat | grep -E "(ProtectedRoute|Keycloak|Auth)"
```

### 步骤 2: 查看关键日志

预期的正常流程日志：

```
[ProtectedRoute] Auth state: { isAuthenticated: false, isLoading: true, user: undefined }
[Keycloak] Initializing...
[Keycloak] Redirecting to login...
[ProtectedRoute] Auth state: { isAuthenticated: false, isLoading: false, user: undefined }
[ProtectedRoute] Not authenticated, redirecting to login
```

登录后的日志应该显示：

```
[Keycloak] Authentication successful
[ProtectedRoute] Auth state: { isAuthenticated: true, isLoading: false, user: 'demo' }
[ProtectedRoute] Authenticated, rendering content
```

### 步骤 3: 检查 URL

登录后，检查浏览器/应用中的 URL：
- 应该是: `http://localhost:5181/m/app/?code=xxx&state=xxx`
- 或者: `http://localhost:5181/m/app/`

如果 URL 中包含 `code` 参数，说明 Keycloak 已成功认证，但应用没有正确处理。

---

## 常见问题

### 问题 1: "Client not found"

**原因**: Keycloak 中没有配置 `mobile-app` 客户端

**解决方案**:
```bash
# 重新导入 Keycloak 配置
docker compose exec keycloak /opt/keycloak/bin/kc.sh import \
  --file /opt/keycloak/data/import/factory-platform-realm.json
```

### 问题 2: Keycloak 重定向 URL 不匹配

**原因**: redirectUri 配置不正确

**解决方案**:
1. 访问 Keycloak 管理界面: `http://localhost:18080/admin`
2. 进入 `Clients` -> `mobile-app` -> `Settings`
3. 确保 `Valid Redirect URIs` 包含: `http://localhost:5181/*`
4. 点击 `Save`

### 问题 3: PKCE 验证失败

**原因**: code_challenge 或 code_verifier 不匹配

**解决方案**:
确保 Keycloak 客户端启用了 PKCE (已在配置中启用)

### 问题 4: Token 交换失败

**原因**: 应用无法使用 auth code 换取 token

**解决方案**:
检查网络连接和 Keycloak 日志：
```bash
docker compose logs keycloak | grep -i error
```

---

## 进一步诊断

### 方法 1: 使用 Web 开发者工具

1. 在 Android Studio 中启动应用
2. 在 Chrome 中打开 `chrome://inspect`
3. 选择你的应用
4. 打开 Console 标签查看日志

### 方法 2: 检查 Keycloak 日志

```bash
docker compose logs -f keycloak
```

### 方法 3: 测试 Keycloak 认证流程

手动测试认证 URL：
```
http://sso.corp.aygjm.lan:18080/realms/factory-platform/protocol/openid-connect/auth?
  client_id=mobile-app&
  redirect_uri=http://localhost:5181/m/app/&
  response_type=code&
  scope=openid&
  state=test123
```

---

## 如果问题仍然存在

### 选项 1: 使用开发模式测试

1. 启动开发服务器：
   ```bash
   cd apps/mobile-app
   pnpm dev
   ```

2. 在浏览器中打开: `http://localhost:5181/m/app/`

3. 测试登录流程

### 选项 2: 检查 Keycloak 客户端配置

1. 访问: `http://localhost:18080/admin/master/console#/factory-platform/clients`
2. 登录 (admin/admin)
3. 检查 `mobile-app` 客户端的:
   - `Valid Redirect URIs`
   - `Web Origins`
   - `Client Authentication` (应该是 OFF)
   - `Standard Flow Enabled` (应该是 ON)

### 选项 3: 查看网络请求

1. 打开 Chrome 开发者工具 (F12)
2. 切换到 Network 标签
3. 登录并观察网络请求
4. 检查是否有失败的请求

---

## 快速修复命令

```bash
# 1. 重新启动 Keycloak
docker compose restart keycloak

# 2. 强制重新导入配置
docker compose exec keycloak /opt/keycloak/bin/kc.sh import \
  --file /opt/keycloak/data/import/factory-platform-realm.json

# 3. 查看 Keycloak 日志
docker compose logs -f keycloak

# 4. 重建 Android 应用
cd apps/mobile-app
rm -rf android/app/build
npx cap sync android
```

---

## 需要帮助？

如果以上方法都无法解决问题，请提供以下信息：

1. **控制台日志**: 完整的浏览器控制台输出
2. **Keycloak 日志**: `docker compose logs keycloak` 的最后 50 行
3. **网络请求**: 登录过程中的所有网络请求
4. **URL**: 登录后浏览器中的完整 URL

这些信息可以帮助快速定位问题。
