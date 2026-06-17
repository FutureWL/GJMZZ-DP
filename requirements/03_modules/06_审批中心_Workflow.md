# 审批中心 Workflow

> 落地:`apps/portal-ui/src/app/pages/workflow/`
> 后端:`apps/factory-api/src/modules/workflow/`(代理 Flowable REST)
> 引擎:Docker 部署的 `flowable-{idm,task,modeler,admin,rest}`(端口 33721-725)
> 沉淀:`docs/workflow/flowable-qc-exception.md`(本期已有的业务案例)

## 1. 总体设计

- **引擎**:Flowable 7(开源 BPMN)
- **接入**:factory-api 的 `workflow` 模块对 Flowable REST 做反向代理 + 业务封装
- **前端**:
  - `/workflow/inbox` 待办
  - `/workflow/done` 已办
  - `/workflow/cc` 抄送
  - `/workflow/detail/:id` 审批详情(节点 + 意见 + 附件位)
- **统一待办**:`ApprovalWorkItem`
  - `domain:'management' | 'support' | 'production' | 'business' | 'additional'`
  - `businessType:'expense_claim' | 'procurement_pr' | 'contract_review'`
  - `businessId` 关联具体业务单据

## 2. 节点模型

```ts
interface ApprovalNode {
  key: string             // 'manager' / 'finance' / 'risk' / 'cashier' 等
  label: string
  assignee: string
  status: 'pending' | 'done' | 'skipped'
  completedAt: string | null
}
```

节点按业务类型不同,例如:
- 费用报销:部门负责人 → 财务复核 → 风控(若超标) → 出纳
- 采购 PR:部门负责人 → 采购经理 → 财务(若超额) → 分管副总
- 合同评审:法务 → 财务 → 分管副总 → 总经理

## 3. 状态机

通用:
```
draft → in_review → (approved | rejected | returned) → (paid | signed) → archived
                                                 ↘ canceled
```

- `returned`:打回申请人修改,回到 `draft` 重新提交
- `skipped`(节点级):不适用本单(如未超标跳过风控)

## 4. 与具体业务单据的关系

| 业务单据 | 走 workflow | 入口 |
|---|---|---|
| ExpenseClaim | ✅ | `/management/expense/:id` |
| ProcurementRequest(PR) | ✅ | `/management/procurement/:id` |
| ContractReviewFlow | ✅ | `/management/contract/:id` |
| 供应商准入 | ✅ | `/management/supplier` |
| AdditionalRequest | ✅ | `/additional/:center/...` |
| MaintenanceTicket | ❌(内置状态机) | `/production/equipment` |
| Incident | ❌(内置状态机) | `/production/incident` |

> 业务级状态机(维修/事故)与 Flowable 解耦,直接用前端状态机即可;**只有"多人协作 + 节点跳转 + 催办/抄送"才走 Flowable**。

## 5. Flowable 容器拓扑

```
db-init-flowable → 创建库 `flowable` / 用户 `flowable`
flowable-idm        用户/组/认证(33721,与 gateway https 端口冲突!调试期注意)
flowable-task       用户任务 UI(33722)
flowable-modeler    流程建模 UI(33723)
flowable-admin      管理 UI(33724)
flowable-rest       REST API(33725)
```

IDM/Task/Modeler/Admin 都依赖 IDM,认证账户 `admin/test`(开发)。

## 6. 关键操作

- 部署流程:Modeler 导出 BPMN → REST 部署 → `factory-api/workflow/deploy`
- 发起流程:业务服务调用 `factory-api/workflow/start`,带 `businessKey`(单据 id)
- 完成任务:调用 Flowable `/task/{id}/complete`
- 待办查询:Flowable `/task?assignee=xxx` → factory-api 包装为 `ApprovalWorkItem`

## 7. 故障案例(沉淀)

- `docs/workflow/flowable-qc-exception.md`:质量异常处理流程的 BPMN 雏形与节点定义。
  - 建议:把这类"领域流程定义"放到本目录 `05_workflow/`,并附 BPMN 文件。

## 8. 待办

- [ ] factory-api 完整封装 Flowable REST(目前在 `workflow` 模块,粒度不足)
- [ ] 多租户/多组织过滤
- [ ] 催办 / 加签 / 减签 / 转办
- [ ] 流程版本管理(Modeler 集成)
- [ ] 业务侧的统一待办(把 mock 中的 `ApprovalWorkItem` 接到真实引擎)
