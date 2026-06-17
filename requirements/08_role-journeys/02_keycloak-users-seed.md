# Keycloak 用户 seed 方案

> 配合 `apps/factory-api/scripts/role-tests/seed-keycloak-users.mjs` 使用。
> 一次性为 15 个业务角色建 Keycloak 用户 + 设置密码 + 写 `public.profile` 表(position)。

## 1. 角色矩阵(15 个)

| 层级 | 角色 ID | 姓名 | 邮箱 | password | profile.position |
|---|---|---|---|---|---|
| 高层 | `ceo` | 张总 | ceo@aygjm.lan | `Pass1234!` | `approver` |
| 高层 | `ceo-deputy` | 李副总 | ceo.deputy@aygjm.lan | `Pass1234!` | `approver` |
| 高层 | `vp-sales` | 王副总 | vp.sales@aygjm.lan | `Pass1234!` | `approver` |
| 高层 | `vp-mfg` | 赵副总 | vp.mfg@aygjm.lan | `Pass1234!` | `approver` |
| 高层 | `vp-finance` | 陈总监 | vp.finance@aygjm.lan | `Pass1234!` | `approver` |
| 中层 | `mgr-production` | 钱经理 | mgr.production@aygjm.lan | `Pass1234!` | `manager` |
| 中层 | `mgr-quality` | 孙经理 | mgr.quality@aygjm.lan | `Pass1234!` | `quality_manager` |
| 中层 | `mgr-procurement` | 周经理 | mgr.procurement@aygjm.lan | `Pass1234!` | `approver` |
| 中层 | `mgr-equipment` | 吴经理 | mgr.equipment@aygjm.lan | `Pass1234!` | `plant_manager` |
| 中层 | `mgr-it` | 郑经理 | mgr.it@aygjm.lan | `Pass1234!` | `approver` |
| 基层 | `worker-leader` | 冯班组长 | worker.leader@aygjm.lan | `Pass1234!` | `approver` |
| 基层 | `planner` | 陈计划员 | planner@aygjm.lan | `Pass1234!` | `approver` |
| 基层 | `inspector` | 褚检验员 | inspector@aygjm.lan | `Pass1234!` | `quality` |
| 基层 | `tech` | 卫维修 | tech@aygjm.lan | `Pass1234!` | `plant_manager` |
| 基层 | `warehouse` | 蒋库管 | warehouse@aygjm.lan | `Pass1234!` | `approver` |

> 简化为:所有角色 `position ∈ {approver, manager, quality_manager, plant_manager, quality}` 之一,匹配现有 BPMN candidateGroups(`approver,manager`、`quality`、`quality_manager,plant_manager`、`plant_manager`)。
> 基层 worker-leader / planner / warehouse 默认 `approver` — 后续按需扩。

## 2. 流程

1. **Keycloak admin API**
   - `POST /admin/realms/{realm}/users` 建用户(json 包含 username / email / enabled / credentials)
   - `PUT /admin/realms/{realm}/users/{id}/reset-password` 设密码(临时=false,登录时不再要求改密)
2. **factory-api / factory DB**
   - `PUT /api/profiles/me` — 每个用户登录后调一次,设 `position` 等
   - 实际由 seed 脚本用 admin-cli 拿每个用户的 token 后,调 `/api/profiles/me`

## 3. 跑法

```bash
node apps/factory-api/scripts/role-tests/seed-keycloak-users.mjs
```

预期输出:

```
[seed] upserting 15 users to realm=factory-platform ...
[seed] ✓ ceo (id=...)
[seed] ✓ ceo-deputy ...
...
[seed] setting profiles ...
[seed] ✓ profile ceo position=approver
...
[seed] DONE: 15 users + 15 profiles
```

## 4. 验收

```bash
# 用 ceo 拿 token
TOKEN=$(curl -sX POST http://sso.corp.aygjm.lan:18080/realms/factory-platform/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" -d "client_id=dev-cli" \
  -d "username=ceo" -d "password=Pass1234!" | jq -r .access_token)
echo "token len: ${#TOKEN}"

# 看档案
curl -sX GET http://localhost:33700/api/profiles/me \
  -H "Authorization: Bearer $TOKEN" | jq .

# 期望:position=approver
```
