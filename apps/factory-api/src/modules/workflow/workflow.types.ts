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

