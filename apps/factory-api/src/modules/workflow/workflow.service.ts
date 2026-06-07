import { Injectable } from '@nestjs/common'

type FlowableListResponse<T> = { data?: T[] }

@Injectable()
export class WorkflowService {
  private readonly baseUrl: string
  private readonly basicAuth: string

  constructor() {
    this.baseUrl = process.env.FLOWABLE_REST_BASE_URL ?? 'http://localhost:33725/flowable-rest/service'
    const user = process.env.FLOWABLE_REST_USER ?? 'rest-admin'
    const password = process.env.FLOWABLE_REST_PASSWORD ?? 'test'
    this.basicAuth = Buffer.from(`${user}:${password}`).toString('base64')
  }

  private async requestJson(path: string, init?: RequestInit): Promise<unknown> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        authorization: `Basic ${this.basicAuth}`,
        'content-type': 'application/json',
        ...(init?.headers ?? {}),
      },
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`Flowable request failed: ${res.status} ${res.statusText} ${text}`)
    }

    return (await res.json()) as unknown
  }

  async listCandidateGroupTasks(groupId: string): Promise<Record<string, unknown>[]> {
    const qs = new URLSearchParams({ candidateGroup: groupId })
    const json = (await this.requestJson(`/runtime/tasks?${qs.toString()}`)) as FlowableListResponse<Record<string, unknown>>
    return json.data ?? []
  }

  async getTask(taskId: string): Promise<Record<string, unknown>> {
    return (await this.requestJson(`/runtime/tasks/${encodeURIComponent(taskId)}`)) as Record<string, unknown>
  }

  async getProcessInstance(processInstanceId: string): Promise<Record<string, unknown>> {
    return (await this.requestJson(
      `/runtime/process-instances/${encodeURIComponent(processInstanceId)}`,
    )) as Record<string, unknown>
  }

  async findProcessInstanceByBusinessKey(businessKey: string): Promise<Record<string, unknown> | null> {
    const qs = new URLSearchParams({ businessKey })
    const json = (await this.requestJson(
      `/runtime/process-instances?${qs.toString()}`,
    )) as FlowableListResponse<Record<string, unknown>>
    return json.data?.[0] ?? null
  }

  async startProcessInstanceByKey(params: {
    processDefinitionKey: string
    businessKey: string
    variables?: Record<string, unknown>
  }): Promise<Record<string, unknown>> {
    const variables = Object.entries(params.variables ?? {}).map(([name, value]) => ({ name, value }))
    return (await this.requestJson('/runtime/process-instances', {
      method: 'POST',
      body: JSON.stringify({
        processDefinitionKey: params.processDefinitionKey,
        businessKey: params.businessKey,
        variables,
      }),
    })) as Record<string, unknown>
  }

  async completeTask(params: { taskId: string; variables?: Record<string, unknown> }): Promise<void> {
    const variables = Object.entries(params.variables ?? {}).map(([name, value]) => ({ name, value }))
    await this.requestJson(`/runtime/tasks/${encodeURIComponent(params.taskId)}`, {
      method: 'POST',
      body: JSON.stringify({ action: 'complete', variables }),
    })
  }

  async deleteProcessInstance(params: { processInstanceId: string; reason?: string }): Promise<void> {
    await this.requestJson(`/runtime/process-instances/${encodeURIComponent(params.processInstanceId)}`, {
      method: 'DELETE',
      body: JSON.stringify({ action: 'delete', reason: params.reason ?? 'withdraw' }),
    })
  }

  async listHistoricTasks(processInstanceId: string): Promise<Record<string, unknown>[]> {
    const qs = new URLSearchParams({ processInstanceId })
    const json = (await this.requestJson(
      `/history/historic-task-instances?${qs.toString()}`,
    )) as FlowableListResponse<Record<string, unknown>>
    return json.data ?? []
  }

  async listHistoricActivities(processInstanceId: string): Promise<Record<string, unknown>[]> {
    const qs = new URLSearchParams({ processInstanceId })
    const json = (await this.requestJson(
      `/history/historic-activity-instances?${qs.toString()}`,
    )) as FlowableListResponse<Record<string, unknown>>
    return json.data ?? []
  }
}

