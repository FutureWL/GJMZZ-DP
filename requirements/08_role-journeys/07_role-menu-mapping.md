# 角色 → 菜单可见映射

> 本期(2026-06-17)实现。让 portal-ui 菜单根据用户的 `profile.position` 动态可见。

## 业务背景

之前 15 角色登录后都看到全部 52 条菜单(容器 + 叶子),无法区分角色域:

- inspector (质量检验员) 看到 `/equipment/workorders`、`/sales/order` 等不相关菜单
- tech (设备维修) 看到 `/quality/inspections`、`/sales/order` 等
- 5 个不同 position 应该看到不同的菜单子集

## 现状

| 维度 | 之前 | 现在 |
|---|---|---|
| 菜单数据来源 | `apps/portal-ui/src/app/api/menus.ts` 的 `MOCK_MENU_JSON` | 同左,但 seed 时叠加 `MENU_REQUIRED_ROLES` 映射 |
| 角色判断来源 | JWT `realm_access.roles`(空) | JWT roles ∪ `public.profile.position` |
| API 响应 | `ApiMenuItem[]` 直接数组 | `{ items, profilePosition, count, roles }` |
| 容器(无 path) | 始终显示 | 叶子全部隐藏后,容器也自动隐藏 |
| 叶子(有 path) | 始终显示 | `required_roles && roles` 命中才显示 |

## 角色枚举(对应 15 用户的 profile.position)

| position | 用户数 | 例子 |
|---|---|---|
| `approver` | 10 | ceo / vp-sales / worker-leader / warehouse |
| `manager` | 1 | mgr-production |
| `quality_manager` | 1 | mgr-quality |
| `quality` | 1 | inspector ⭐ |
| `plant_manager` | 2 | mgr-equipment / tech |

## 验证结果(2026-06-17)

| 角色 | position | 可见菜单数 | 备注 |
|---|---|---|---|
| inspector | quality | 24 | 仅质量检验 + 审批 + 通知 + 工作台 |
| tech | plant_manager | 29 | 设备运维 + 报工 + 费用 + 审批 |
| mgr-production | manager | 52 | 全可见(approver+manager 都覆盖) |
| mgr-quality | quality_manager | ~31 | 质量 + 设备 + 审批 + 权限矩阵 |
| mgr-equipment | plant_manager | 29 | 同 tech |
| mgr-procurement / mgr-it | approver | 51 | 全业务(除权限矩阵) |
| ceo / vp-* / worker-leader / planner / warehouse | approver | 51 | 同 mgr-procurement |

## 实现细节

### 1. 后端:MenusController 合并角色源

`apps/factory-api/src/modules/menus/menus.controller.ts`:

```typescript
const jwtRoles = parseRealmRoles(req.user?.realm_access)
const profile = await this.profiles.getByUserId(userId)  // 注入 ProfilesService
const merged = [...jwtRoles, profile?.position ?? '']
return { items: await this.menus.listForUser('main', merged), profilePosition: profile?.position }
```

需:
- `MenusModule.imports: [ProfilesModule]`(修改 `menus.module.ts`)
- `ProfilesModule.exports: [ProfilesService]`(修改 `profiles.module.ts`,否则 DI 失败)

### 2. seed 数据:menu-required-roles.mjs

新建 `apps/factory-api/scripts/menu-required-roles.mjs`,维护 `id → requiredRoles[]` 映射。

`seed-menus.mjs` 在生成 SQL 前用该映射覆盖原 `MOCK_MENU_JSON` 的 `requiredRoles`,然后同步到 `infra/db-init/factory-03-menus.sql` 供 db-init 容器持久化。

**映射示例**:

```js
'/quality/inspections': ['approver', 'manager', 'quality_manager', 'quality'],
'/equipment/workorders': ['approver', 'manager', 'quality_manager', 'plant_manager'],
'/management/security/permissions': ['manager', 'quality_manager', 'plant_manager'],
'/management/erp/expenses': ['approver', 'manager', 'quality_manager', 'plant_manager'],
```

### 3. 前端:Sidebar 自动隐藏空容器

`apps/portal-ui/src/app/utils/menu.ts` 中 `buildMenuTree`:

```ts
if (!to && children.length === 0) return null  // 空容器不返回
```

`useUserMenu.ts` 中 `extractItems` 适配新响应:

```ts
function extractItems(raw) {
  if (isFlatMenuArray(raw)) return ...
  if (isTreeMenuArray(raw)) return ...
  if (raw?.items && isFlatMenuArray(raw.items)) return ...  // 新版响应
  ...
}
```

## 测试覆盖

### API 层(`scripts/role-tests/verify-menu-visibility.sh`)

5 角色 × 期望见 / 期望隐藏断言,直接调 `/api/menus/me`:

```bash
bash apps/factory-api/scripts/role-tests/verify-menu-visibility.sh
# 输出:inspector / tech / mgr-production / mgr-procurement / ceo 全部 ✓
```

### 角色 API smoke(15 个,均已适配新映射)

| 文件 | 适配 |
|---|---|
| `test-ceo.sh` 等 5 高层 | 阈值保持 40,断言不变 |
| `test-mgr-production.sh` | 阈值 40(manager 全可见 52) |
| `test-mgr-quality.sh` | 阈值 20,断言保留质量域 |
| `test-mgr-equipment.sh` | 阈值 20,断言保留设备域 |
| `test-mgr-it.sh` | `权限矩阵` 改为 `expect_not_contains`(IT 经理是 approver) |
| `test-mgr-procurement.sh` | 阈值 40 |
| `test-inspector.sh` | 阈值 20,断言保留质量检验 |
| `test-tech.sh` | 阈值 20,断言保留设备域 |
| 其他 approver 角色 | 阈值 40 |

`common.sh` 新增 `expect_not_contains` 辅助函数。

### 浏览器 e2e(`e2e/role-menu-visibility.spec.js`)

5 个 Playwright 测试,用真实 Keycloak 登录后从 DOM 抓 `a[href]` 验证侧边栏:

```bash
npx playwright test e2e/role-menu-visibility.spec.js
# 5 passed (15.5s)
```

截图保存在 `requirements/08_role-journeys/e2e-screenshots/menu-visibility/`。

## 重新 seed 流程

如果改了 `menu-required-roles.mjs`:

```bash
cd apps/factory-api
node scripts/seed-menus.mjs   # 重新生成 SQL + 应用到 DB
```

下次启动容器时,`infra/db-init/factory-03-menus.sql` 会自动跑(已写在 `infra/db-init/README.md`)。

## 已知限制

1. 只过滤叶子,**容器**不按 requiredRoles 过滤(始终显示,空才隐藏)
2. JWT 的 `realm_access.roles` 实际未使用 Keycloak realm role(都是 `default-roles-*`),所以现在实际就只看 `profile.position`
3. 角色集合是 OR 语义:`required_roles && roles`(命中任一即可见)
4. 没实现 "角色 → 按钮可见" 的细粒度权限(后续若需要可基于 `useAuth` 的 position 派生)

## 后续可做

- 把 `requiredRoles` 也用于按钮可见性(`canApprove(businessType, position)`)
- 加 `required_departments` 字段(部门维度隔离)
- Keycloak realm role 与 profile.position 双轨(目前用后者)