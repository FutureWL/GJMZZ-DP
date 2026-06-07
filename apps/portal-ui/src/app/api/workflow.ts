import { apiGet, apiPost } from './client'

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

export async function getMyWorkflowTasks(token: string, params?: { tenantId?: string }) {
  const qs = new URLSearchParams()
  if (params?.tenantId) qs.set('tenantId', params.tenantId)
  const suffix = qs.toString() ? `?${qs.toString()}` : ''
  return await apiGet<WorkflowTaskListItem[]>(`/workflow/tasks/me${suffix}`, token)
}

export async function getWorkflowTaskDetail(token: string, taskId: string) {
  return await apiGet<WorkflowTaskDetail>(`/workflow/tasks/${encodeURIComponent(taskId)}`, token)
}

export async function completeWorkflowTask(
  token: string,
  taskId: string,
  body: { action: 'APPROVE' | 'BACK'; comment?: string },
) {
  return await apiPost<{ ok: true }>(`/workflow/tasks/${encodeURIComponent(taskId)}/complete`, token, body)
}

export async function getWorkflowInstanceByBusinessKey(token: string, businessKey: string) {
  return await apiGet<Record<string, unknown> | null>(
    `/workflow/instances/by-business-key/${encodeURIComponent(businessKey)}`,
    token,
  )
}

export async function startWorkflowInstanceByBusinessKey(token: string, businessKey: string) {
  return await apiPost<Record<string, unknown>>(
    `/workflow/instances/by-business-key/${encodeURIComponent(businessKey)}/start`,
    token,
    {},
  )
}

export async function withdrawWorkflowProcessInstance(token: string, processInstanceId: string, reason?: string) {
  return await apiPost<{ ok: true }>(
    `/workflow/process-instances/${encodeURIComponent(processInstanceId)}/withdraw`,
    token,
    reason ? { reason } : {},
  )
}

export async function getWorkflowProcessHistory(token: string, processInstanceId: string) {
  return await apiGet<{ tasks: Record<string, unknown>[]; activities: Record<string, unknown>[] }>(
    `/workflow/process-instances/${encodeURIComponent(processInstanceId)}/history`,
    token,
  )
}
