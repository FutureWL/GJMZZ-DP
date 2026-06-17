# 管理域 Management

> 落地:`apps/portal-ui/src/app/pages/management/`
> 优先级:详见各子模块
> 关键角色:总经理/营销副总/采购经理/中层管理者

## 1. 子模块清单

| 子模块 | 路径 | 优先级 | 状态 | 关键对象 |
|---|---|---|---|---|
| 费用报销 Expense | `/management/expense` | P0 | ✅(mock) | `ExpenseClaim` |
| 采购管理 Procurement | `/management/procurement` | P0 | ✅(mock) | `ProcurementRequest`、RFQ/PO |
| 供应商管理 SRM | `/management/supplier` | P0 | ✅(mock) | `Supplier` |
| 外协工厂 Subcontract | `/management/subcontract` | P0 | ✅(mock) | (待补) |
| 合同评审 Contract | `/management/contract` | P0 | ✅(mock) | `ContractReviewFlow` |
| 目标与 KPI | `/management/kpi` | P1 | 🟡 | 占位 |
| 预算与计划 | `/management/budget` | P1 | 🟡 | 占位 |
| 制度/流程库 | `/management/policy` | P1 | 🟡 | 占位 |
| 审计/内控 | `/management/audit` | P1 | 🟡 | 占位 |

## 2. 费用报销(Expense)P0

- 列表:`/management/expense`,支持按状态/部门/项目/成本中心/申请人筛选
- 详情:`/management/expense/:id`,显示费用行 + 审批节点 + 时间轴
- 状态机:`draft → in_review → approved/rejected/returned → paid → archived/canceled`
- 节点:多级审批(部门负责人 → 财务 → 风控 → 出纳)
- 预算/超标控制:`isOverBudget` / `isOverStandard` + 必填原因
- 关联:项目、成本中心、收款人(personal/corporate + 银行账号)

## 3. 采购管理(Procurement)P0

- **PR(申请)** 列表 + 详情(行项目:物料/规格/数量/单价/到货日期/类别)
- **RFQ(询价/比价)**:供应商报价对比表
- **定标/中标**:确认中标供应商
- **PO(订单)**:交付/收货节点(视觉位)
- **采购分析看板**:花费结构、价格趋势、节省、交付及时率

## 4. 供应商管理(SRM)P0

- 列表(标签:资质/风险/绩效):`risk` 等级、`compliance` 状态、`otd`(准时交付率)、`ppm`(质量 PPM)
- 详情:概览 + 资质证照 + 交付与质量 + 风险事件
- 准入申请(表单 + 附件位) + 审批轨迹位
- 绩效评分配置(规则位,P1)

## 5. 外协工厂管理(Subcontract)P0

- 列表(产能/准时率/质量)
- 详情(产能日历位、在制/交付、质量摘要)
- 外协工单列表 + 详情(计划/进度/质检节点位)
- 对账结算(P1)

## 6. 合同评审(Contract)P0

- 列表 + 详情
- 状态:`draft / in_review / approved / rejected / returned / signed / archived / canceled`
- 字段:合同类型 / 对方 / 金额 / 付款条款 / 风险等级
- 审批节点 + 时间轴 + 附件

## 7. 与流程中心的关系

本域大量业务(PR/合同/费用/供应商准入)都走审批中心,具体见 `06_审批中心_Workflow.md`。

## 8. 待办

- [ ] 接入真实后端(目前 mock)
- [ ] 预算/超标计算口径
- [ ] 供应商绩效评分公式
- [ ] 与 ERP/SAP 集成(本期不做)
