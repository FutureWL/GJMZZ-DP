export type WorkflowTaskListItem = {
  id: string
  name: string
  created: string
  assignee: string | null
  owner: string | null
  processInstanceId: string
}

export type WorkflowTaskDetail = {
  task: Record<string, unknown>
  processInstance: Record<string, unknown> | null
  businessKey: string | null
}

export type WorkflowAction = 'APPROVE' | 'BACK'

export type WorkflowProcessDefinition = {
  id: string
  key: string
  name: string
  version: number
  deploymentId: string
}

export type WorkflowStartInput = {
  businessKey: string
  processDefinitionKey?: string
  variables?: Record<string, unknown>
}

export type WorkflowDeployInput = {
  name: string
  bpmnXml: string
  // 可选:同时支持 key 冲突时的租户/类别设置(本期不实现)
  // category?: string
  // tenantId?: string
}
