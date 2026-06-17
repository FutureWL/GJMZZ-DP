# 04 SSO 与权限设计

## 1. 总体方案

- **IdP**:Keycloak 26.0.5(`quay.io/keycloak/keycloak:26.0.5`),启动时 `--import-realm` 导入 `infra/compose/sso-dev/realm/` 下的 realm 配置。
- **协议**:OIDC(Authorization Code + PKCE),前端用 `keycloak-js@26.0.5`。
- **后端校验**:`factory-api` 通过 `jose` 校验 Bearer JWT,issuer 为 `http://sso.corp.aygjm.lan:18080/realms/factory-platform`。
- **域名约定**:`sso.corp.aygjm.lan`(需在 hosts 加 `127.0.0.1 sso.corp.aygjm.lan`),与 issuer/回调地址一致,避免 logout/redirect_uri 报错。

## 2. Realm 导入(infra/compose/sso-dev/realm)

- 启动时由 Keycloak 自动 import。
- 内容应包含:
  - realm `factory-platform`
  - 客户端:`portal-ui`、`mobile-portal-ui`、`cockpit-ui`、`mobile-app`、`factory-api`
  - 角色(高/中/基层 15 个,见 `00_overview/03_三层组织与角色.md`)
  - 测试用户(可选)

## 3. 前端集成模式

每个前端 App 内都有 Keycloak 初始化包装(典型模式):

```ts
// 伪代码,具体以仓库实现为准
const keycloak = new Keycloak({
  url: 'http://sso.corp.aygjm.lan:18080',
  realm: 'factory-platform',
  clientId: 'portal-ui',
})

await keycloak.init({ onLoad: 'check-sso', silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html' })
```

- `silent-check-sso.html` 需在 `public/` 下提供(用于静默 SSO 检测)。
- 登录/登出:`keycloak.login()` / `keycloak.logout()`。
- 401/403:`factory-api` 触发 401 时前端强制 `keycloak.login()`。

## 4. 后端校验

`factory-api` 的 `auth` 模块使用 `jose` 做 JWT 校验:

```ts
// 伪代码
const JWKS = createRemoteJWKSet(new URL(`${issuer}/protocol/openid-connect/certs`))
const { payload } = await jwtVerify(token, JWKS, { issuer })
// 提取 realm_access.roles → 注入 req.user
```

环境变量:

- `AUTH_ENABLED=true`
- `AUTH_ISSUER=http://sso.corp.aygjm.lan:18080/realms/factory-platform`

`AUTH_ENABLED=false` 时为开发模式,所有请求视为匿名(便于无 SSO 调试)。

## 5. 权限粒度(本期)

| 层级 | 实现 | 备注 |
|---|---|---|
| **认证** | Keycloak | 必须 |
| **角色** | Keycloak realm role | 简单映射到 `req.user.roles` |
| **菜单可见** | 前端 `meta.roles`(待实现) | 占位 |
| **数据行级** | (本期不做) | 后续按工厂/部门维度切 |

## 6. 多应用 / 多客户端

| 客户端 | clientId | 公开/机密 | 用途 |
|---|---|---|---|
| portal-ui | `portal-ui` | public(Authorization Code + PKCE) | PC 门户 |
| mobile-portal-ui | `mobile-portal-ui` | public | H5 |
| cockpit-ui | `cockpit-ui` | public | 大屏 |
| mobile-app | `mobile-app` | public | 原生 |
| factory-api | `factory-api` | bearer-only | 资源服务,不参与 SSO 流程 |

## 7. 反代与跨域

- 网关层(nginx)反代 `/auth/` 到 keycloak,避免 CORS。
- `factory-api` 默认 `enableCors({ origin: true, credentials: true })`,开发期宽松。
- 生产期应收敛到 `factory-platform` 域名白名单。

## 8. 已知坑

- 浏览器代理把 `sso.corp.aygjm.lan` 走代理导致 502 → 须加白名单或走直连。
- mobile-app(原生)WebView 内 `silent-check-sso` 因文件协议可能不工作,需要提供 file:// 兼容或跳转。
- Keycloak 24+ 默认不再自动 import realm JSON,必须显式 `--import-realm`(本 compose 已加)。
