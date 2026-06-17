# 支持域 Support

> 落地:`apps/portal-ui/src/app/pages/support/`
> 关键角色:各部门负责人 + 全员(各支持线)

## 1. 子模块清单

| 子模块 | 路径 | 优先级 | 状态 |
|---|---|---|---|
| 支持门户首页 | `/support` | P0 | ✅ |
| 行政 Admin | `/support/admin` | P1 | 🟡 占位 |
| 人事 HR | `/support/hr` | P1 | 🟡 |
| 财务 Finance | `/support/finance` | P0(走费用) | 🟡 |
| 审计 Audit | `/support/audit` | P1 | 🟡 |
| 体系 System | `/support/system` | P1 | 🟡 |
| 安保 Security | `/support/security` | P1 | 🟡 |
| 信息/IT | `/support/it-tickets` | P0 | ✅(mock `ItTicket`) |
| 数据安全 | `/support/data-security` | P1 | 🟡 |
| EHS(安全环保) | `/support/ehs` | P1 | 🟡 |

## 2. IT 工单(P0)

- 字段:`status: new/accepted/processing/verifying/closed` + `sla: normal/overdue`
- 流程:受理 → 处理 → 验证 → 关闭
- 与"附加域"申请类单据边界:**IT 工单是支持线内部工单,申请类业务走"附加"**

## 3. 财务

- 预算/费用报销:实际落在管理域 `/management/expense`,此处仅做"导航 + 驾驶舱摘录"
- 报销单据的回写状态:同步到 `paid` 节点

## 4. 审计/合规

- 计划、整改项闭环(占位)
- 关联管理域的"内控/审计整改"

## 5. EHS

- 隐患台账、整改闭环(占位)
- 与生产域的"事故/异常"互通(同事件两视角)

## 6. 通知与消息

- `NotificationItem`(info/warning/error) + 全局消息中心(顶部铃铛)
- 推送:本期不做真实推送,只做 Web 端轮询

## 7. 审计日志

- `AuditLogEntry`(actor / action / resourceType / resourceId / detail / ip / at)
- 接入管理域审批的关键动作(本期不做)

## 8. 待办

- [ ] IT 工单接入 `factory-api`
- [ ] EHS/安保事件的整改闭环
- [ ] 审计日志的统一收集
