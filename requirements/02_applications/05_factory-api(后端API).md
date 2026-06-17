# 05 factory-api(后端 API)

> 路径:`apps/factory-api/`
> 端口:容器内 3001,主机 33704;网关反代在 `/api/`
> 角色:平台后端,本期覆盖认证/菜单/工厂/事故/流程代理

## 1. 技术栈

- NestJS 10(`@nestjs/common`、`@nestjs/core`)
- Fastify 4(`@nestjs/platform-fastify`)+ `@fastify/static`
- Prisma 6.8 + `@prisma/client`
- PostgreSQL(`pg` 8)
- `@nestjs/swagger`(OpenAPI 文档 `/docs`)
- `jose`(JWT 校验)
- `dotenv`(.env 注入)

## 2. 目录结构

```
apps/factory-api/
├── Dockerfile
├── nest-cli.json
├── prisma/
│   └── schema.prisma      # 当前仅 Incident 模型
├── src/
│   ├── main.ts            # bootstrap + Swagger
│   └── modules/
│       ├── app/           # AppModule 汇总
│       ├── auth/          # JWT/Keycloak 校验
│       ├── db/            # 数据库连通性
│       ├── factories/     # 工厂主数据
│       ├── health/        # /health
│       ├── incidents/     # 事故(已落库)
│       ├── menus/         # 业务菜单
│       ├── prisma/        # PrismaService
│       ├── profiles/      # 用户档案
│       └── workflow/      # Flowable 代理
├── tsconfig.{json,build.json}
└── package.json
```

## 3. 已实现模块

| 模块 | 说明 | 备注 |
|---|---|---|
| `app` | 根 Module,注册各 feature module | |
| `auth` | 校验 Keycloak JWT(issuer/audience) | 需 `AUTH_ENABLED=true` |
| `db` | 简单连通性测试接口 | |
| `factories` | 工厂列表/详情(对接 Prisma 或 mock) | |
| `health` | `/health` 健康检查 | |
| `incidents` | 事故的 CRUD(已用 Prisma 持久化到 `incident` 表) | P0 重点 |
| `menus` | 业务菜单(可见性) | |
| `prisma` | PrismaService 注入 | |
| `profiles` | 用户档案(展示当前 Keycloak 用户) | |
| `workflow` | 代理 Flowable REST API(任务/流程/部署) | |

## 4. 环境变量

| 变量 | 必填 | 默认 | 说明 |
|---|---|---|---|
| `PORT` | 否 | 3001 | 容器内监听 |
| `DATABASE_URL` | 是 | - | `postgres://factory:factory@db:5432/factory` |
| `AUTH_ENABLED` | 否 | `true` | `false` 时不校验 JWT |
| `AUTH_ISSUER` | 否 | `http://sso.corp.aygjm.lan:18080/realms/factory-platform` | Keycloak issuer |

## 5. 数据模型(Prisma)

```prisma
model Incident {
  id          String   @id
  occurredAt  String
  reportedBy  String
  type        String
  severity    String
  status      String
  factoryId   String
  factoryName String
  line        String?
  workOrderId String?
  orderId     String?
  equipment   String?
  material    String?
  description String
  attachments String[]
  createdAt   String
  updatedAt   String

  @@map("incident")
}
```

> 完整业务模型(采购/费用/合同/审批/通知/审计/客户/订单 等)见 `04_data/01_数据模型与Mock设计.md` 与 `packages/mock-data/src/models.ts`。

## 6. 启动

```bash
# 容器化
docker compose up -d --build factory-api

# 本地开发
pnpm -C apps/factory-api dev
# 默认监听 3001

# 生成 Prisma Client
pnpm -C apps/factory-api build   # 内含 prisma generate
```

## 7. 与其他 App 的关系

- **上游**:portal-ui / mobile-portal-ui / cockpit-ui / mobile-app 走 `/api/*` 调用
- **下游**:
  - Postgres(业务库)
  - Keycloak(校验 JWT,远端 JWKS)
  - Flowable(`/flowable-rest` 等,本服务代理其 REST)

## 8. 待办

- [ ] Prisma 接入更多业务表(目前只有 Incident)
- [ ] 统一异常过滤器 + 日志
- [ ] 单元/e2e 测试
- [ ] OpenTelemetry 追踪
