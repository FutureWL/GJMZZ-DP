# 业务库初始化 SQL(factory)

> 业务库 `factory` 的"必备表 + 种子数据"。
> 与 `docker-compose.yml` 里 `db-init-keycloak` / `db-init-flowable` 风格一致 — 但本期**未接入**自动容器化,需手工执行(见下)。

## 文件清单(按编号顺序执行)

| 文件 | 说明 | 状态 |
|---|---|---|
| `factory-01-profile.sql` | 用户档案表,`factory-api` 的 `profiles` 模块依赖 | 2026-06-16 |
| `factory-02-workflow-bridge.sql` | 业务侧镜像 Flowable 流程实例(L4 用) | 2026-06-16 |
| `factory-03-menus.sql` | 侧边栏菜单(从 `apps/portal-ui/src/app/api/menus.ts` 同步) | 2026-06-16 |

## 手工执行(当前方式)

```bash
# 进入 postgres 容器,跑所有 SQL(按文件编号顺序)
for f in /root/DataDisk/workspace/GJMZZ-DP/infra/db-init/factory-*.sql; do
  echo "==> $f"
  docker exec -i factory-platform-db-1 psql -U factory -d factory -v ON_ERROR_STOP=1 < "$f"
done
```

## 自动执行(推荐后续接入)

跟 `db-init-keycloak` / `db-init-flowable` 一样,加一个一次性容器:

```yaml
# docker-compose.yml(节选)
db-init-business:
  image: postgres:16-alpine
  environment:
    PGHOST: db
    PGPORT: 5432
    PGUSER: factory
    PGPASSWORD: factory
  depends_on:
    db:
      condition: service_healthy
  volumes:
    - ./infra/db-init:/docker-entrypoint-initdb.d:ro
  restart: "no"
```

**注意**:`postgres:16-alpine` 镜像只对 `docker-entrypoint-initdb.d/*.{sql,sh}` 在**首次启动**执行(即数据目录为空时);现有数据不会自动重跑。如需重新 seed,删 `./data/postgres` 后再起。

## 重新 seed 菜单

菜单表的数据从 `apps/portal-ui/src/app/api/menus.ts` 同步。如果前端 mock 改了:

```bash
node apps/factory-api/scripts/seed-menus.mjs
```

该脚本会:
1. 提取最新 MOCK_MENU_JSON
2. 重新生成 `factory-03-menus.sql`
3. `truncate` + 重新插入到 `public.menu_item`
4. 验证行数

## 表清单

```
public.profile              user_id PK
public.workflow_bridge      business_key PK
public.menu_item            id PK,parent_id 自引用
```

详细 schema 见各 SQL 文件。
