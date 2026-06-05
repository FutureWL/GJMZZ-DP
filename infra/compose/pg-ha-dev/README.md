# 本地三节点 PostgreSQL HA（RPO=0 模拟）

## 功能
- 三节点 PostgreSQL（1 Primary + 1 Sync Standby + 1 Async Standby）
- 通过同步复制保证单机房 RPO=0（同步备不可用时写入会阻塞/不可写）
- 本地统一连接入口：pgpool（映射到宿主机端口）
- 初始化 schema 与种子数据（仅首次初始化生效）

## 启动
在本目录执行：

```powershell
Copy-Item .env.example .env
docker compose up -d
```

## 连接信息
- 连接地址：`localhost:${PGPOOL_PORT}`（默认 5432）
- 数据库：`${POSTGRESQL_DATABASE}`（默认 factory）
- 用户：`${POSTGRESQL_USERNAME}`（默认 app）
- 密码：`${POSTGRESQL_PASSWORD}`（默认 app）

## 管理 UI（Adminer）
- 访问地址：`http://localhost:${ADMINER_PORT}`（默认 8081）
- 登录建议使用 pgpool 入口：
  - System：PostgreSQL
  - Server：pgpool
  - Username：`${POSTGRESQL_USERNAME}`
  - Password：`${POSTGRESQL_PASSWORD}`
  - Database：`${POSTGRESQL_DATABASE}`

## 管理 UI（CloudBeaver，推荐）
- 访问地址：`http://localhost:${CLOUDBEAVER_PORT}`（默认 8978）
- 首次进入需要在页面里初始化管理员账号（按页面提示）
- 新建连接建议填：
  - Host：pgpool
  - Port：5432
  - Database：`${POSTGRESQL_DATABASE}`
  - Username：`${POSTGRESQL_USERNAME}`
  - Password：`${POSTGRESQL_PASSWORD}`

示例：

```powershell
docker compose exec -T pg-0 bash -lc "PGPASSWORD=$POSTGRESQL_PASSWORD /opt/bitnami/postgresql/bin/psql -h pgpool -p 5432 -U $POSTGRESQL_USERNAME -d $POSTGRESQL_DATABASE -c 'select now()'"
```

## 查看集群状态

```powershell
docker compose exec -T pg-0 bash -lc "PGPASSWORD=$POSTGRESQL_POSTGRES_PASSWORD /opt/bitnami/postgresql/bin/psql -U postgres -d postgres -c 'show synchronous_standby_names'"
docker compose exec -T pg-0 bash -lc "PGPASSWORD=$POSTGRESQL_POSTGRES_PASSWORD /opt/bitnami/postgresql/bin/psql -U postgres -d postgres -c 'select application_name,state,sync_state from pg_stat_replication'"
```

## 清理

```powershell
docker compose down -v
```
