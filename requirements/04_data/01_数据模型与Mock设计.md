# 01 数据模型与 Mock 设计

> 数据层是"业务真意"在代码侧的凝固点。本文档梳理当前所有领域对象、其形态、来源与待落库进度。

## 1. 三类数据来源

| 来源 | 用途 | 覆盖范围 | 落地 |
|---|---|---|---|
| `packages/mock-data/src/models.ts` | TypeScript 接口定义 | 几乎所有域 | 仅类型,数据在 `data.ts/additional.ts/orders.ts` |
| `apps/factory-api/prisma/schema.prisma` | 真实持久化 | 当前只 `Incident` | Postgres `incident` 表 |
| Keycloak/Flowable/外部 | 平台自身数据 | 用户/组/角色、流程定义、字典 | 不在本仓库管理 |

## 2. 业务对象清单(`models.ts` 顺序)

### 2.1 通用基础
- `Severity`:`critical | high | medium | low`
- `NoticeLevel`:`info | warning | error`

### 2.2 生产域
- `Alarm`:告警
- `WorkOrder`:工单
- `TraceRecord`:批次/序列追溯
- `MesDispatch`:派工
- `QualityTask`:检验任务
- `EquipmentAsset`:设备
- `MaintenanceTicket`:维修工单(含状态机与节点)
- `MaintenanceFlowNode` / `MaintenanceSpareUsage` / `MaintenanceTimelineEntry`
- `Factory`:工厂
- `MorningMeetingKpi` / `MorningRisk`:晨会
- `DeliveryRisk`:交付风险(规则/手工)
- `Incident`:事故(已落库)

### 2.3 经营域
- `Customer` / `Opportunity` / `Contact` / `CrmActivity`
- `Quote` / `QuoteLine`

### 2.4 管理域
- `PurchaseRequest`(基础版)
- `ProcurementRequest` / `ProcurementRequestLine` / `ProcurementRequestFlowNode` / `ProcurementRequestTimelineEntry`(增强版,带流程)
- `Supplier`
- `Expense`
- `ExpenseClaim` / `ExpenseClaimLine` / `ExpenseApprovalNode` / `ExpenseClaimTimelineEntry`
- `ContractReviewFlow` / `ContractReviewFlowNode` / `ContractReviewTimelineEntry`
- `ApprovalWorkItem`:统一待办
- `Department` / `Project` / `CostCenter`

### 2.5 支持域
- `ItTicket`
- `NotificationItem`
- `AuditLogEntry`

### 2.6 附加域
- `AdditionalCenter` / `AdditionalService` / `AdditionalRequest` / `AdditionalContent`
- `AdditionalRole` / `AdditionalRoleBinding` / `AdditionalMember`

## 3. 状态机速查

| 对象 | 状态 |
|---|---|
| Alarm | `open / ack / closed` |
| WorkOrder | `planned / running / blocked / done` |
| TraceRecord.quality | `ok / ng / hold` |
| PurchaseRequest/ProcurementRequest | `draft / in_review / approved / rejected / returned / canceled`(ProcurementRequest 增强) |
| Supplier.risk | `low / medium / high / critical` |
| Supplier.compliance | `ok / expiring / blacklist` |
| ItTicket | `new / accepted / processing / verifying / closed` |
| ItTicket.sla | `normal / overdue` |
| Customer.level | `A / B / C` |
| Opportunity.stage | `lead / proposal / negotiation / won / lost` |
| MesDispatch.status | `new / doing / done` |
| QualityTask.status | `todo / doing / done` |
| QualityTask.result | `ok / ng / hold / null` |
| ExpenseClaim.status | `draft / in_review / approved / rejected / returned / paid / archived / canceled` |
| ExpenseApprovalNode.status | `pending / done / skipped` |
| ContractReview.status | `draft / in_review / approved / rejected / returned / signed / archived / canceled` |
| ContractReview.riskLevel | `low / medium / high` |
| ApprovalWorkItem.status | `todo / done` |
| NotificationItem.level | `info / warning / error` |
| MorningMeetingKpi.status | `good / warn / bad` |
| MorningRisk.type | `delivery / material_shortage / quality / equipment / plan / other` |
| DeliveryRisk.type | `material_shortage / bottleneck / quality` |
| DeliveryRisk.status | `open / watching / archived` |
| DeliveryRisk.source | `rule / manual` |
| Incident.type | `quality / equipment / material_shortage / plan / safety / other` |
| Incident.status | `recording / archived` |
| MaintenanceTicket.priority | `low / medium / high / critical` |
| MaintenanceTicket.status | `reported / dispatched / accepted / on_site / repairing / done / verified / closed / canceled` |
| AdditionalRequest.status | `draft / submitted / accepted / in_progress / done / rejected / canceled` |
| AdditionalService.type | `apply / enroll / query` |
| AdditionalContent.type | `notice / policy / faq` |

## 4. 数据文件

- `data.ts`:核心业务样例(工单/告警/供应商/...)
- `orders.ts`:订单/报价/合同样例
- `additional.ts`:附加域样例(党群/工会/妇联)

> 这些样例只用于前端原型,**不应视为生产数据**。

## 5. 与真实数据库的差距(本期)

| 对象 | 落库? | 计划 |
|---|---|---|
| Incident | ✅ Prisma | 已完成 |
| Factory | ❌(走 mock) | `factory-api/modules/factories` 已有 controller,补 Prisma |
| 工单 WorkOrder | ❌ | P1 计划 |
| 检验任务 | ❌ | P1 |
| 设备/维修 | ❌ | P1 |
| 客户/机会 | ❌ | P1 |
| 费用/合同/PR | ❌ | 走 Flowable(状态由引擎管) |
| 通知/审计日志 | ❌ | P2 |

## 6. 待办

- [ ] 抽取 `models.ts` 中的关键对象为 Prisma schema(逐个迁移)
- [ ] 统一前后端模型(避免 `Incident` 字段名不一致,例如 `occurredAt` 是否改 `occurred_at`)
- [ ] Seed 脚本(基于 mock-data 生成数据库初始数据)
