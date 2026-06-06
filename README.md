# 数字化平台（本地开发环境）

本仓库使用 Docker Compose 在本机一键启动网关、前端、后端、SSO(Keycloak)、数据库与常用中间件。当前设计为 **单 Postgres 实例**：业务库 `factory` 与 SSO 库 `keycloak` 共用同一个 Postgres，但使用不同 database。

## 快速开始

1. 复制环境变量

```powershell
Copy-Item .env.example .env
```

2. 启动

```powershell
docker compose up -d --build
```

3. 查看状态

```powershell
docker compose ps
```

4. 停止

```powershell
docker compose down --remove-orphans
```

## 访问地址（默认端口）

| 模块 | 地址 |
|---|---|
| 网关（统一入口） | http://localhost:33700/ |
| Portal UI | http://localhost:33701/ |
| Mobile Portal UI | http://localhost:33702/ |
| Cockpit UI | http://localhost:33703/ |
| Factory API | http://localhost:33704/ |
| Postgres | localhost:33705 |
| CloudBeaver | http://localhost:33706/ |
| Redis | localhost:33707 |
| RabbitMQ AMQP | localhost:33708 |
| RabbitMQ 管理台 | http://localhost:33709/ |
| MinIO S3 | http://localhost:33710/ |
| MinIO Console | http://localhost:33711/ |
| TDengine | localhost:33712 / 33713 / 33714 |
| Keycloak（SSO） | http://localhost:18080/ |

## SSO（Keycloak）

### 域名（可选但推荐）

如需按域名访问（与回调地址一致），在本机 hosts 增加：

- `127.0.0.1 sso.corp.aygjm.lan`

Keycloak 访问：

- http://sso.corp.aygjm.lan:18080/
- 管理端：http://sso.corp.aygjm.lan:18080/admin

默认管理员账号来自 `.env`：

- `KC_ADMIN_USERNAME` / `KC_ADMIN_PASSWORD`

### 重要说明：浏览器代理

如果浏览器访问 `sso.corp.aygjm.lan` 出现 502，但 curl 正常，通常是系统/软件代理导致。把该域名加入代理的“忽略/直连”列表即可。

## 数据库（单实例）

本地 Postgres 只保留一个实例（根 compose 的 `db`），数据落盘在：

- `./data/postgres/`

默认账号（来自根 compose 的 `db` 环境变量）：

- 业务库：`factory`，用户：`factory`，密码：`factory`
- SSO 库：`keycloak`，用户：`keycloak`，密码：`keycloak`

Keycloak 的 `keycloak` database 与用户由启动时的 `db-init-keycloak` 自动创建。

## CloudBeaver（数据库管理）

访问：

- http://localhost:33706/

首次进入如果提示初始化过期/需要重启：

```powershell
docker compose restart cloudbeaver
```

如需重置 CloudBeaver 工作区（会丢失 CloudBeaver 的配置与连接信息）：

- 删除 `./data/cloudbeaver/` 后再启动

## 环境变量（统一根目录）

项目统一使用根目录 `.env`：

- `.env.example`：示例模板
- `.env`：本机实际配置（已被 `.gitignore` 忽略）

根 `docker-compose.yml` 会自动读取根目录 `.env`；子目录的 compose 如需运行，请显式传入：

```powershell
docker compose --env-file ../../.env up -d
```

## 常见问题

### 端口占用/启动失败

```powershell
docker compose down --remove-orphans
docker compose up -d --build
```

### 只保留一个 Postgres

当前设计已删除其他 compose 中的 Postgres 定义，避免出现重复实例与数据目录冲突。请始终使用根 compose 的 `db`。

