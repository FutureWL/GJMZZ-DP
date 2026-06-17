# 02 Prisma 与数据库设计

> 后端 ORM:Prisma 6.8(`apps/factory-api/prisma/`)
> 数据库:PostgreSQL 16(单实例多 database)

## 1. 当前 schema

```prisma
// apps/factory-api/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Incident {
  id          String   @id
  occurredAt  String   @map("occurred_at")
  reportedBy  String   @map("reported_by")
  type        String
  severity    String
  status      String
  factoryId   String   @map("factory_id")
  factoryName String   @map("factory_name")
  line        String?
  workOrderId String?  @map("work_order_id")
  orderId     String?  @map("order_id")
  equipment   String?
  material    String?
  description String
  attachments String[]
  createdAt   String   @map("created_at")
  updatedAt   String   @map("updated_at")

  @@map("incident")
}
```

## 2. 设计决策(已落地的)

| 决策 | 描述 | 原因 |
|---|---|---|
| 表名 `incident`(单数) | 显式 `@@map` | 与 Keycloak/Flowable 等单数表名风格一致 |
| 时间字段为 `String` | 不使用 `DateTime` | 跨服务时区/格式灵活;后续可视情况改 `DateTime` |
| 主键 `String`(业务 id) | 而非自增 `Int` | 与 mock-data 的 `id` 风格一致,便于复制样例 |
| `attachments String[]` | 数组 | PG 原生支持;若需查询附件元数据,后续拆为子表 |

## 3. 数据库拓扑(单 Postgres)

| database | 拥有者 | 用途 |
|---|---|---|
| `factory` | `factory/factory` | 业务库(本期只有 `incident` 表) |
| `keycloak` | `keycloak/keycloak` | Keycloak 内部(由 `db-init-keycloak` 创建) |
| `flowable` | `flowable/flowable` | Flowable 内部(由 `db-init-flowable` 创建) |

> 三个 database 共用一个 Postgres 容器,数据卷 `./data/postgres`。
> 注意:任何"加表"动作只能改 `factory` 库,不能动 `keycloak`/`flowable`。

## 4. 计划中的扩展表(P1+)

> 不在本期落库,仅作需求层记录。

- `factory` 库:
  - `work_order` / `quality_task` / `mes_dispatch`
  - `equipment_asset` / `maintenance_ticket`
  - `customer` / `opportunity` / `quote` / `quote_line`
  - `it_ticket` / `audit_log` / `notification`
  - `user_profile` / `factory_master` / `line_master`
  - 字典:`dict_type` / `dict_entry`

## 5. 迁移工作流

```bash
# 1. 修改 prisma/schema.prisma
# 2. 生成 client
pnpm -C apps/factory-api exec prisma generate
# 3. 容器内执行 migration(在 db 健康后)
docker compose exec factory-api pnpm prisma migrate deploy
# 4. 开发期可使用 db push
pnpm -C apps/factory-api exec prisma db push
```

> 本仓库的 `factory-api` build 脚本已包含 `prisma generate`(`prisma generate && tsc -p tsconfig.build.json`)。

## 6. PrismaService(`apps/factory-api/src/modules/prisma/`)

- 注入 `PrismaClient` 实例
- 启用 NestJS Lifecycle hooks(`onModuleInit` / `onModuleDestroy`)
- 业务模块通过 DI 拿到 `PrismaService` 后调用 `this.prisma.incident.findMany()` 等

## 7. 待办

- [ ] 引入 `prisma migrate`(目前是 schema first,无 migration history)
- [ ] 完善 `Incident` 的索引(按 `factoryId/occurredAt/status`)
- [ ] 软删除(`deletedAt` 字段,全表统一)
- [ ] 审计字段规范(`createdAt/createdBy/updatedAt/updatedBy`)
