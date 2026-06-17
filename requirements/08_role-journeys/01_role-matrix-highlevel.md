# 角色 × 功能矩阵 · 高层(5 角色)

> 与 `requirements/00_overview/03_三层组织与角色.md` 对应;本表聚焦**功能层**——每个角色能做什么、走哪些 API/UI 路径。
> 配合 `02_keycloak-users-seed.md`(用户建账号) + `05_acceptance-checklist.md`(人工验收步骤) 使用。

## 1. 角色清单

| 角色 ID | 姓名(测试用) | 业务定位 | profile.position | 默认落地页 |
|---|---|---|---|---|
| `ceo` | 张总 | 总经理 | `approver`(终审) | 经营驾驶舱 |
| `ceo-deputy` | 李副总 | 常务副总 | `approver` | 经营驾驶舱 |
| `vp-sales` | 王副总 | 营销副总 | `approver` | 经营驾驶舱(营销) |
| `vp-mfg` | 赵副总 | 制造副总 | `approver` | 生产总览 |
| `vp-finance` | 陈总监 | 财务/风控负责人 | `approver` | 审批中心(风险/超时) |

> 简化:所有高层 `position=approver`,匹配 `simple_approval_v1` 的 candidateGroups(approver,manager)。
> 后续 BPMN 加 group(如 finance / risk)时再扩。

## 2. 功能矩阵(每角色可执行项)

### 2.1 通用(全员可)

| 功能 | 路径 | 入口菜单 | API |
|---|---|---|---|
| 登录 | `http://127.0.0.1:33700/portal/` | — | OIDC |
| 修改个人档案 | `/account/profile` | 顶部用户菜单 | `GET/PUT /api/profiles/me` |
| 全局搜索 | `/search` | 顶部 | (无后端) |
| 看消息中心 | `/management/notifications` | 通知中心 | (占位) |

### 2.2 总经理(ceo)

| 序号 | 功能 | 路径 | API | 验收要点 |
|---|---|---|---|---|
| H1.1 | 看经营驾驶舱 | `/business/cockpit` | `GET /api/factories`(若已落库) | KPI 卡(收入/订单/回款/毛利)显示 |
| H1.2 | 看经营分析(占位) | `/business/analysis` | — | 占位页 |
| H1.3 | 看审批中心真实待办 | `/management/approval` | `GET /api/workflow/tasks/me` | 看到 approver group 的待办 |
| H1.4 | 办理审批任务 | `/workflow/tasks/:id` | `GET /api/workflow/tasks/:id` + `POST /complete` | 同意/退回 → 流程推进 |
| H1.5 | 看生产总览(下钻) | `/production/overview` | `GET /api/incidents` | 工厂列表/告警/产线状态 |
| H1.6 | 看告警中心 | `/production/alarm` | (mock + Flowable) | alarm 列表 |
| H1.7 | 看支持门户首页 | `/support` | (占位) | — |

### 2.3 常务副总(ceo-deputy)

| 序号 | 功能 | 路径 | API | 验收要点 |
|---|---|---|---|---|
| H2.1-H2.7 | 同 H1(总经理路径完全一致) | 同上 | 同上 | 与总经理同样能看/批 |
| H2.8 | 看经营驾驶舱"部门下钻" | `/business/cockpit` 选部门 | — | (若已实现) |

### 2.4 营销副总(vp-sales)

| 序号 | 功能 | 路径 | API | 验收要点 |
|---|---|---|---|---|
| H3.1 | 看经营驾驶舱 | `/business/cockpit` | 同 H1.1 | 同 H1.1 |
| H3.2 | 看客户列表 | `/sales/crm/customers` | (mock) | A/B/C 分级 |
| H3.3 | 看机会 | `/sales/business/opportunities` | (mock) | 漏斗 stage |
| H3.4 | 看报价 | `/sales/business/quotes` | (mock) | 状态/金额 |
| H3.5 | 看销售订单 | `/sales/order` | (mock) | 列表 |
| H3.6 | 看订单360 | `/sales/business/order360` | (mock) | (占位) |
| H3.7 | 提交合同评审 | `/management/contract/reviews/new` → submit | `POST /api/workflow/instances` (businessType=contract_review) | 流程启动 |
| H3.8 | 审批合同(自审自批演示) | `/management/approval` → 办理 | `completeWorkflowTask` | 流程结束 |
| H3.9 | 看经营驾驶舱(营销) | `/business/cockpit` | 同 H1.1 | — |

### 2.5 制造副总(vp-mfg)

| 序号 | 功能 | 路径 | API | 验收要点 |
|---|---|---|---|---|
| H4.1 | 看生产总览 | `/production/overview` | 同 H1.5 | 工厂列表 |
| H4.2 | 看工单列表 | `/production/execution/workorders` | (mock) | 工单状态 |
| H4.3 | 看排程(甘特) | `/production/execution/scheduling` | (mock) | (占位) |
| H4.4 | 看质量 | `/quality/inspections` | (mock) | 检验任务 |
| H4.5 | 看设备监控 | `/equipment/monitoring` | (mock) | OEE |
| H4.6 | 看告警中心 | `/production/alarm` | 同 H1.6 | alarm |
| H4.7 | 看质量异常 → 走 qc_exception_v1 | `/production/incidents/:id` | `POST /api/workflow/instances` (qc_exception_v1) | 多步流程 |
| H4.8 | 审批中心 | `/management/approval` | 同 H1.3 | approver 待办 |

### 2.6 财务/风控负责人(vp-finance)

| 序号 | 功能 | 路径 | API | 验收要点 |
|---|---|---|---|---|
| H5.1 | 审批中心(默认落地页) | `/management/approval` | 同 H1.3 | 看到 approver 待办 |
| H5.2 | 提交费用报销 | `/management/erp/expenses` → 新建 | `POST /api/workflow/instances` (businessType=expense_claim) | 流程启动 |
| H5.3 | 提交采购 PR | `/supply/procurement/create-pr` | `POST /api/workflow/instances` (businessType=procurement_pr) | 流程启动 |
| H5.4 | 看费用流程看板 | `/management/expense/dashboard` | (mock) | (占位) |
| H5.5 | 看通知中心 | `/management/notifications` | (占位) | — |
| H5.6 | 看审计日志 | `/management/audit/log` | (占位) | — |
| H5.7 | 看权限矩阵 | `/management/security/permissions` | (占位) | — |

## 3. 关键依赖(高层通用)

| 依赖 | 状态 | 影响功能 |
|---|---|---|
| `simple_approval_v1` BPMN 已部署 | ✅ | 所有审批 |
| `qc_exception_v1` BPMN 已部署 | ✅ | 制造副总 H4.7 |
| 真实菜单 seed 52 条 | ✅ | 所有侧边栏 |
| profile.position=approver(全员) | 待本次建用户时设 | canAct 判断 |
| Keycloak `dev-cli` 客户端 directAccess | ✅ | ROPC 拿 token |

## 4. 自动化测试范围

- **API 层**:`apps/factory-api/scripts/role-tests/test-ceo.sh` 等 5 个脚本(高层各一)
- **浏览器层**:Playwright 跑核心场景(登录 → 菜单 → 审批中心 → 详情页),产出截图到 `e2e-screenshots/highlevel/`
- **冒烟**:复用 `smoke-workflow.sh` / `smoke-workflow-l3.sh`

## 5. 验收清单对应

每角色的具体人工操作步骤见 `05_acceptance-checklist.md`(本目录)。
