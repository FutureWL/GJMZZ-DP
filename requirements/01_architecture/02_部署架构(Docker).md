# 02 部署架构(Docker Compose)

## 1. 启动序列

```bash
# 0. 复制环境变量(首次)
cp .env.example .env

# 1. 构建并后台启动
docker compose up -d --build

# 2. 查看状态
docker compose ps

# 3. 停止
docker compose down --remove-orphans
```

启动时序(隐式依赖,见 compose 的 `depends_on` + `condition`):

```
postgres(db) 健康
   ├── db-init-keycloak ──> keycloak ──> factory-api
   └── db-init-flowable ──> flowable-idm ──> flowable-task/modeler/admin/rest
其他服务(gateway/redis/rabbitmq/minio/tdengine/cloudbeaver)独立启动
前端 3 个 + mobile-app 容器由 gateway 依赖
```

## 2. 端口总表(再次确认,见 `00_overview/04_*`)

`33 7xx` 段避免与宿主机常用服务冲突;`18080` 给 Keycloak 是因为 8080 在本机常被占用。

## 3. 数据持久化

| 数据 | 卷 | 主机路径 |
|---|---|---|
| Postgres | bind mount | `./data/postgres` |
| Keycloak | named volume | `keycloak_data`(默认在 Docker volume 目录) |
| Redis AOF | bind mount | `./data/redis` |
| RabbitMQ | bind mount | `./data/rabbitmq` |
| MinIO | bind mount | `./data/minio` |
| CloudBeaver 工作区 | bind mount | `./data/cloudbeaver` |
| TDengine | bind mount | `./data/tdengine/{data,log}` |

`.gitignore` 须确保 `./data/` 全部不进入版本库。

## 4. 配置注入

- 根 `.env` 由根 compose 直接读取(`environment:` / `args:`)。
- 子 compose(若有)需显式 `--env-file ../../.env`(见 README 提示)。
- 代理:`HTTP_PROXY` / `HTTPS_PROXY` / `NO_PROXY` 同时传给 `tdengine` 等需要联网的镜像。
- Keycloak admin 用户/密码来自 `.env` 的 `KC_ADMIN_USERNAME` / `KC_ADMIN_PASSWORD`(默认 `admin/admin`,仅本机)。

## 5. 反代(infra/nginx/gateway.conf)

由该文件统一定义路径 → 上游容器的映射,例如:

- `/` → portal-ui 或 mobile-portal-ui(按 UA)
- `/m/` → mobile-portal-ui
- `/c/` → cockpit-ui
- `/api/` → factory-api
- `/tools/minio/` → minio console 重定向
- `/rabbitmq/` → rabbitmq 管理台
- `/auth/` → keycloak(本机可走 18080,网关可同时反代)

具体路径以 `gateway.conf` 为准(本文不复制其内容,避免漂移)。

## 6. 健康检查与重启策略

- `db` 配 `healthcheck: pg_isready`,`db-init-*` 一次性任务 `restart: "no"`。
- 业务服务 `restart: unless-stopped`,宿主机重启后自动拉起。
- 调试期建议:`docker compose logs -f factory-api` / `docker compose logs -f keycloak`。

## 7. 常见运维动作(详见 `06_runtime/02_*`)

- 端口冲突:`docker compose down --remove-orphans && docker compose up -d --build`
- 重置 CloudBeaver:`rm -rf ./data/cloudbeaver` 后再起
- 完全重置业务库:`docker compose down -v`(注意会清空所有数据卷)
- 查看 Keycloak realm 导入日志:`docker compose logs keycloak | grep -i realm`
