# 流程引擎(Workflow)沉淀

> 入口文档见 `requirements/03_modules/06_审批中心_Workflow.md`(架构与 API)
> 本目录沉淀**具体业务领域**的流程定义(BPMN、节点、规则)

## 1. 现有沉淀

| 文档 | 来源 | 业务 |
|---|---|---|
| `flowable-qc-exception.md` | `docs/workflow/flowable-qc-exception.md`(原仓) | 质量异常处理流程(QC Exception) |

## 2. 计划补充

| 业务 | 拟补 | 优先级 |
|---|---|---|
| 费用报销 Expense | 节点/规则 | P0 |
| 采购申请 PR | 节点/规则 | P0 |
| 合同评审 Contract | 节点/规则 | P0 |
| 供应商准入 | 节点/规则 | P0 |
| 维修工单 | 内置状态机(不接 Flowable) | P0 文档化 |
| 事故处理 | 内置状态机(不接 Flowable) | P0 文档化 |

## 3. 文档模板(每流程一份)

```md
# <业务名> 流程定义

## 1. 业务背景
- 谁发起
- 触发条件
- SLA

## 2. 流程图
- BPMN(iobpmn)截图或 SVG
- 或 Mermaid 流程图

## 3. 节点
| key | label | assignee | 跳过条件 | SLA |
|---|---|---|---|---|

## 4. 表单字段
- 业务字段 + 校验 + 必填

## 5. 关键事件
- 撤回 / 加签 / 催办

## 6. 边界
- 与其他流程/状态机的关系
```

## 4. 实施建议

- 每个流程**先在此处写规范**,再在 Flowable Modeler 中建模,最后从 `flowable-modeler` 导出 BPMN 放入 `05_workflow/bpmn/`。
- 流程定义文件命名:`<business-type>-<version>.bpmn20.xml`(如 `expense-claim-v1.bpmn20.xml`)。
