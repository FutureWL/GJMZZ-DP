# Flowable 落地（质量异常 v1）

## 部署（本仓库 docker-compose）

本仓库根目录的 [docker-compose.yml](file:///d:/Documents/01.%E5%B7%A5%E4%BD%9C%E8%B5%84%E6%96%99/09.%E6%99%BA%E8%83%BD%E5%88%B6%E9%80%A0%E4%B8%BB%E9%A2%98%EF%BC%88%E7%B2%BE%E5%AF%86%E5%88%B6%E9%80%A0%EF%BC%89/05.%E4%BF%A1%E6%81%AF%E5%8C%96%E5%B7%A5%E4%BD%9C/01.%E6%95%B0%E5%AD%97%E5%8C%96%E5%B9%B3%E5%8F%B0%E8%AE%BE%E8%AE%A1%E5%BC%80%E5%8F%91/docker-compose.yml) 已补充 Flowable 组件，并复用现有 Postgres（db）创建 `flowable` 数据库。

端口映射（Host → Container）：

- Flowable IDM：`33721:8080`，入口 `http://localhost:33721/flowable-idm`
- Flowable Task：`33722:8080`，入口 `http://localhost:33722/flowable-task`
- Flowable Modeler：`33723:8080`，入口 `http://localhost:33723/flowable-modeler`
- Flowable Admin：`33724:8080`，入口 `http://localhost:33724/flowable-admin`
- Flowable REST（Swagger）：`33725:8080`，入口 `http://localhost:33725/flowable-rest/docs`

默认账号（按镜像默认配置）：

- Flowable UI（IDM 登录）：`admin / test`
- Flowable REST Basic Auth：`rest-admin / test`

## 业务约定

### 岗位分配（candidateGroups）

统一按岗位分配待办：

- `candidateGroup = {tenantId}:{positionCode}`
- 第一期如果未启用租户隔离，可暂时只用 `positionCode`

其中：

- `tenantId`：工厂/组织维度 ID（建议与 factories.id 对齐）
- `positionCode`：岗位编码（建议用可枚举的短码，如 QE、QE_MGR、PROD_MGR）

### 退回与会签规则（v1 已确认）

- 退回：固定退回到“发起人补充”
- 会签：全员通过

## BPMN 建模（v1 最小闭环）

建议流程定义：

- `processDefinitionKey = qc_exception_v1`
- `businessKey = incidentId`（质量异常单号/主键）

节点建议（可在 Modeler 中创建）：

1. 发起（Start）
2. 质量初审（UserTask，candidateGroups = `QE`）
3. 处置会签（Multi-Instance UserTask，assigneeList 由上一步确定）
4. 关闭归档（UserTask，candidateGroups = `QE` 或 `QE_MGR`）
5. 结束（End）

退回（BACK）建议在每个关键节点后加网关，回到“发起人补充”节点（UserTask，assignee = initiatorUserId）。

## 变量（v1）

启动流程变量：

- `initiatorUserId: string` 发起人 userId（Keycloak token.sub）
- `tenantId?: string` 租户/工厂（后续集团化必备）

审批动作变量（完成任务时写入）：

- `action: 'APPROVE' | 'BACK'`
- `comment: string` 审批意见
- `backTo: 'INITIATOR' | ''` v1 固定用 INITIATOR

会签变量：

- `assigneeList: string[]` 会签人员 userId 列表

## 后端对接（NestJS）

后端新增模块：

- [workflow.module.ts](file:///d:/Documents/01.%E5%B7%A5%E4%BD%9C%E8%B5%84%E6%96%99/09.%E6%99%BA%E8%83%BD%E5%88%B6%E9%80%A0%E4%B8%BB%E9%A2%98%EF%BC%88%E7%B2%BE%E5%AF%86%E5%88%B6%E9%80%A0%EF%BC%89/05.%E4%BF%A1%E6%81%AF%E5%8C%96%E5%B7%A5%E4%BD%9C/01.%E6%95%B0%E5%AD%97%E5%8C%96%E5%B9%B3%E5%8F%B0%E8%AE%BE%E8%AE%A1%E5%BC%80%E5%8F%91/apps/factory-api/src/modules/workflow/workflow.module.ts)
- [workflow.controller.ts](file:///d:/Documents/01.%E5%B7%A5%E4%BD%9C%E8%B5%84%E6%96%99/09.%E6%99%BA%E8%83%BD%E5%88%B6%E9%80%A0%E4%B8%BB%E9%A2%98%EF%BC%88%E7%B2%BE%E5%AF%86%E5%88%B6%E9%80%A0%EF%BC%89/05.%E4%BF%A1%E6%81%AF%E5%8C%96%E5%B7%A5%E4%BD%9C/01.%E6%95%B0%E5%AD%97%E5%8C%96%E5%B9%B3%E5%8F%B0%E8%AE%BE%E8%AE%A1%E5%BC%80%E5%8F%91/apps/factory-api/src/modules/workflow/workflow.controller.ts)
- [workflow.service.ts](file:///d:/Documents/01.%E5%B7%A5%E4%BD%9C%E8%B5%84%E6%96%99/09.%E6%99%BA%E8%83%BD%E5%88%B6%E9%80%A0%E4%B8%BB%E9%A2%98%EF%BC%88%E7%B2%BE%E5%AF%86%E5%88%B6%E9%80%A0%EF%BC%89/05.%E4%BF%A1%E6%81%AF%E5%8C%96%E5%B7%A5%E4%BD%9C/01.%E6%95%B0%E5%AD%97%E5%8C%96%E5%B9%B3%E5%8F%B0%E8%AE%BE%E8%AE%A1%E5%BC%80%E5%8F%91/apps/factory-api/src/modules/workflow/workflow.service.ts)

需要配置的环境变量（factory-api）：

- `FLOWABLE_REST_BASE_URL`，默认 `http://localhost:33725/flowable-rest/service`
- `FLOWABLE_REST_USER`，默认 `rest-admin`
- `FLOWABLE_REST_PASSWORD`，默认 `test`
- `FLOWABLE_QC_EXCEPTION_PROCESS_DEFINITION_KEY`，默认 `qc_exception_v1`

接口（v1）：

- `GET /workflow/tasks/me?tenantId=`：按当前登录用户岗位聚合待办
- `GET /workflow/tasks/:id`：任务详情（含 businessKey）
- `POST /workflow/tasks/:id/complete`：完成任务（APPROVE/BACK）
- `GET /workflow/instances/by-business-key/:businessKey`：按业务单号查询运行中实例
- `POST /workflow/instances/by-business-key/:businessKey/start`：按业务单号发起流程
- `POST /workflow/process-instances/:id/withdraw`：撤回（删除运行中实例）
- `GET /workflow/process-instances/:id/history`：历史任务/活动（用于轨迹展示）

## 前端对接（portal-ui）

新增：

- API：[workflow.ts](file:///d:/Documents/01.%E5%B7%A5%E4%BD%9C%E8%B5%84%E6%96%99/09.%E6%99%BA%E8%83%BD%E5%88%B6%E9%80%A0%E4%B8%BB%E9%A2%98%EF%BC%88%E7%B2%BE%E5%AF%86%E5%88%B6%E9%80%A0%EF%BC%89/05.%E4%BF%A1%E6%81%AF%E5%8C%96%E5%B7%A5%E4%BD%9C/01.%E6%95%B0%E5%AD%97%E5%8C%96%E5%B9%B3%E5%8F%B0%E8%AE%BE%E8%AE%A1%E5%BC%80%E5%8F%91/apps/portal-ui/src/app/api/workflow.ts)
- 工作台待办面板：[TodosPanel.tsx](file:///d:/Documents/01.%E5%B7%A5%E4%BD%9C%E8%B5%84%E6%96%99/09.%E6%99%BA%E8%83%BD%E5%88%B6%E9%80%A0%E4%B8%BB%E9%A2%98%EF%BC%88%E7%B2%BE%E5%AF%86%E5%88%B6%E9%80%A0%EF%BC%89/05.%E4%BF%A1%E6%81%AF%E5%8C%96%E5%B7%A5%E4%BD%9C/01.%E6%95%B0%E5%AD%97%E5%8C%96%E5%B9%B3%E5%8F%B0%E8%AE%BE%E8%AE%A1%E5%BC%80%E5%8F%91/apps/portal-ui/src/app/pages/workbench/TodosPanel.tsx)
- 任务办理页：[WorkflowTaskPage.tsx](file:///d:/Documents/01.%E5%B7%A5%E4%BD%9C%E8%B5%84%E6%96%99/09.%E6%99%BA%E8%83%BD%E5%88%B6%E9%80%A0%E4%B8%BB%E9%A2%98%EF%BC%88%E7%B2%BE%E5%AF%86%E5%88%B6%E9%80%A0%EF%BC%89/05.%E4%BF%A1%E6%81%AF%E5%8C%96%E5%B7%A5%E4%BD%9C/01.%E6%95%B0%E5%AD%97%E5%8C%96%E5%B9%B3%E5%8F%B0%E8%AE%BE%E8%AE%A1%E5%BC%80%E5%8F%91/apps/portal-ui/src/app/pages/workflow/WorkflowTaskPage.tsx)

质量异常详情页增加了“流程（Flowable）”面板，用异常单号作为 businessKey 发起流程并展示轨迹（示例实现）：[IncidentDetailPage.tsx](file:///d:/Documents/01.%E5%B7%A5%E4%BD%9C%E8%B5%84%E6%96%99/09.%E6%99%BA%E8%83%BD%E5%88%B6%E9%80%A0%E4%B8%BB%E9%A2%98%EF%BC%88%E7%B2%BE%E5%AF%86%E5%88%B6%E9%80%A0%EF%BC%89/05.%E4%BF%A1%E6%81%AF%E5%8C%96%E5%B7%A5%E4%BD%9C/01.%E6%95%B0%E5%AD%97%E5%8C%96%E5%B9%B3%E5%8F%B0%E8%AE%BE%E8%AE%A1%E5%BC%80%E5%8F%91/apps/portal-ui/src/app/pages/production/incidents/IncidentDetailPage.tsx)

