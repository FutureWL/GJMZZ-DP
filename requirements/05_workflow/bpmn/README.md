# 通用审批 BPMN / 流程定义

> L2 引入。流程源文件在 `infra/flowable/bpmn/`,与本目录通过软引用保持一致。

## 1. 已有流程

| key | 名称 | 节点 | candidateGroups | 业务入口 |
|---|---|---|---|---|
| `simple_approval_v1` | 通用单步审批 | start → userTask(审批)→ end | `approver` / `manager` | 管理域业务单据(费用/PR/合同/供应商准入),L3 接入 |
| `qc_exception_v1` | 质量异常处理 | start → isolate(quality)→ review(quality_manager/plant_manager)→ dispose(plant_manager)→ end | `quality` / `quality_manager` / `plant_manager` | 生产域 `IncidentDetailPage` 已接入(原有) |

## 2. 部署方式

### 2.1 用 factory-api 端点(推荐,需先启动 API)
```bash
curl -sX POST http://localhost:33704/api/workflow/process-definitions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"simple-approval-v1\",\"bpmnXml\":$(jq -Rs . < infra/flowable/bpmn/simple-approval-v1.bpmn20.xml)}"
```

### 2.2 用 seed 脚本(不需要 token)
```bash
node apps/factory-api/scripts/seed-flowable-definitions.mjs
```
脚本会扫描 `infra/flowable/bpmn/*.bpmn20.xml`,逐个 multipart 部署到 Flowable REST。

## 3. 启动流程

```bash
# 业务单据(用 businessKey 关联)
curl -sX POST http://localhost:33704/api/workflow/instances \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "businessKey": "EXP-20260616-001",
    "processDefinitionKey": "simple_approval_v1",
    "variables": { "businessType": "expense_claim", "amount": 1234.56 }
  }'
```

## 4. 演示路径(L1 已可用)

要让 `/api/workflow/tasks/me` 能列出任务,需让样例用户的 `profile.position` 等于 BPMN 的某个 `candidateGroups`:

| 流程 | 让样例用户的 `position` 设为 |
|---|---|
| `simple_approval_v1` | `approver` 或 `manager` |
| `qc_exception_v1` | `quality` / `quality_manager` / `plant_manager` |

更新示例(用 portal-ui 登录后):
```bash
curl -X PUT http://localhost:33704/api/profiles/me \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "position": "approver" }'
```

## 5. 后续

- [ ] 部署:CI/启动时自动执行 seed 脚本(目前手工)
- [ ] 建模:Flowable Modeler UI 调整并 export,替换源文件
- [ ] 业务接入 L3:费用/PR/合同提交时调用 `/api/workflow/instances`
- [ ] 状态同步 L4:完成回调业务侧 PATCH
