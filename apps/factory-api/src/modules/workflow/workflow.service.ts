import { Injectable } from '@nestjs/common'

import type { WorkflowProcessDefinition } from './workflow.types'

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

    // Flowable 某些端点(complete)返回 204 + 空 body,容忍这种情况
    const text = await res.text().catch(() => '')
    if (!text) return null
    try {
      return JSON.parse(text) as unknown
    } catch {
      return text
    }
  }

  // ----- 任务 -----

  async listCandidateGroupTasks(groupId: string): Promise<Record<string, unknown>[]> {
    const qs = new URLSearchParams({ candidateGroup: groupId })
    const json = (await this.requestJson(`/runtime/tasks?${qs.toString()}`)) as FlowableListResponse<Record<string, unknown>>
    return json.data ?? []
  }

  async getTask(taskId: string): Promise<Record<string, unknown>> {
    return (await this.requestJson(`/runtime/tasks/${encodeURIComponent(taskId)}`)) as Record<string, unknown>
  }

  async completeTask(params: { taskId: string; variables?: Record<string, unknown> }): Promise<void> {
    const variables = Object.entries(params.variables ?? {}).map(([name, value]) => ({ name, value }))
    await this.requestJson(`/runtime/tasks/${encodeURIComponent(params.taskId)}`, {
      method: 'POST',
      body: JSON.stringify({ action: 'complete', variables }),
    })
  }

  // ----- 流程实例 -----

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

  /**
   * 查已结束的流程实例(L4 用:已结束的流程在 /runtime/process-instances 查不到)
   */
  async findHistoricProcessInstanceByBusinessKey(businessKey: string): Promise<Record<string, unknown> | null> {
    const qs = new URLSearchParams({ businessKey })
    const json = (await this.requestJson(
      `/history/historic-process-instances?${qs.toString()}`,
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

  async deleteProcessInstance(params: { processInstanceId: string; reason?: string }): Promise<void> {
    await this.requestJson(`/runtime/process-instances/${encodeURIComponent(params.processInstanceId)}`, {
      method: 'DELETE',
      body: JSON.stringify({ action: 'delete', reason: params.reason ?? 'withdraw' }),
    })
  }

  // ----- 历史 -----

  async listHistoricTasks(processInstanceId: string): Promise<Record<string, unknown>[]> {
    const qs = new URLSearchParams({ processInstanceId })
    const json = (await this.requestJson(
      `/history/historic-task-instances?${qs.toString()}`,
    )) as FlowableListResponse<Record<string, unknown>>
    return json.data ?? []
  }

  /**
   * 查询指定流程实例的 active user task(进行中、未分配/已分配均可)
   * - 内部调 Flowable `/runtime/tasks?processInstanceId=xxx`
   * - 业务侧详情页审批按钮需要 taskId 走此端点
   */
  async getActiveTaskByProcessInstance(processInstanceId: string): Promise<Record<string, unknown> | null> {
    const qs = new URLSearchParams({ processInstanceId })
    const json = (await this.requestJson(
      `/runtime/tasks?${qs.toString()}`,
    )) as FlowableListResponse<Record<string, unknown>>
    // 只取 user task(过滤其他类型),多个取第一个
    const tasks = (json.data ?? []).filter((t) => {
      const delegation = t.delegationState
      const suspended = t.suspended
      return !suspended && delegation !== 'resolved'
    })
    return tasks[0] ?? null
  }

  /**
   * 查询 task 的候选组/候选用户(identity links)
   * - 内部调 Flowable `/runtime/tasks/{id}/identitylinks`
   * - 返回 { groups: string[], users: string[] }
   */
  async getTaskIdentityLinks(taskId: string): Promise<{ groups: string[]; users: string[] }> {
    try {
      const url = `/runtime/tasks/${encodeURIComponent(taskId)}/identitylinks`
      const json = (await this.requestJson(url)) as unknown
      // identitylinks 返回的是纯数组(不是 {data: [...]})
      const links: Record<string, unknown>[] = Array.isArray(json)
        ? (json as Record<string, unknown>[])
        : ((json as FlowableListResponse<Record<string, unknown>>).data ?? [])
      const groups: string[] = []
      const users: string[] = []
      for (const link of links) {
        const type = typeof link.type === 'string' ? link.type : ''
        if (type === 'candidate') {
          const group = typeof link.group === 'string' ? link.group : null
          const user = typeof link.user === 'string' ? link.user : null
          if (group) groups.push(group)
          if (user) users.push(user)
        }
      }
      return { groups: [...new Set(groups)], users: [...new Set(users)] }
    } catch {
      return { groups: [], users: [] }
    }
  }

  async listHistoricActivities(processInstanceId: string): Promise<Record<string, unknown>[]> {
    const qs = new URLSearchParams({ processInstanceId })
    const json = (await this.requestJson(
      `/history/historic-activity-instances?${qs.toString()}`,
    )) as FlowableListResponse<Record<string, unknown>>
    return json.data ?? []
  }

  // ----- 流程定义(L2 新增)-----

  async listProcessDefinitions(): Promise<WorkflowProcessDefinition[]> {
    const qs = new URLSearchParams({ size: '200' })
    const json = (await this.requestJson(
      `/repository/process-definitions?${qs.toString()}`,
    )) as FlowableListResponse<Record<string, unknown>>
    return (json.data ?? []).map((d) => this.mapProcessDefinition(d))
  }

  async getLatestProcessDefinitionByKey(key: string): Promise<WorkflowProcessDefinition | null> {
    const qs = new URLSearchParams({ key, latest: 'true' })
    const json = (await this.requestJson(
      `/repository/process-definitions?${qs.toString()}`,
    )) as FlowableListResponse<Record<string, unknown>>
    const first = (json.data ?? [])[0]
    return first ? this.mapProcessDefinition(first) : null
  }

  /**
   * 部署流程定义(上传 BPMN XML)
   * - 走 multipart/form-data,字段名 deployment
   * - 同时把 deploymentName 设为传入的 name
   */
  async deployProcessDefinition(input: { name: string; bpmnXml: string }): Promise<WorkflowProcessDefinition> {
    // 构造 multipart/form-data
    const boundary = `----FactoryApiBoundary${Date.now()}`
    const fileFieldName = 'deployment'
    const fileName = `${input.name || 'flowable-def'}.bpmn20.xml`

    const head = `--${boundary}\r\nContent-Disposition: form-data; name="deploymentName"\r\n\r\n${input.name}\r\n`
    const fileHeader = `--${boundary}\r\nContent-Disposition: form-data; name="${fileFieldName}"; filename="${fileName}"\r\nContent-Type: application/xml\r\n\r\n`
    const tail = `\r\n--${boundary}--\r\n`

    const body = head + fileHeader + input.bpmnXml + tail

    const res = await fetch(`${this.baseUrl}/repository/deployments`, {
      method: 'POST',
      headers: {
        authorization: `Basic ${this.basicAuth}`,
        'content-type': `multipart/form-data; boundary=${boundary}`,
      },
      body,
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`Flowable deploy failed: ${res.status} ${res.statusText} ${text}`)
    }

    const text = await res.text().catch(() => '')
    if (!text) {
      throw new Error('Flowable deploy returned empty body')
    }
    const deployResp = JSON.parse(text) as { id: string; name: string; deploymentTime: string }
    // 部署完成后,根据 deploymentId 取其下的 process-definitions
    const qs = new URLSearchParams({ deploymentId: deployResp.id })
    const listJson = (await this.requestJson(
      `/repository/process-definitions?${qs.toString()}`,
    )) as FlowableListResponse<Record<string, unknown>>
    const def = (listJson.data ?? [])[0]
    if (!def) {
      throw new Error('Deployed but no process definition returned by Flowable')
    }
    return this.mapProcessDefinition(def)
  }

  private mapProcessDefinition(d: Record<string, unknown>): WorkflowProcessDefinition {
    return {
      id: String(d.id ?? ''),
      key: String(d.key ?? ''),
      name: String(d.name ?? ''),
      version: Number(d.version ?? 0),
      deploymentId: String(d.deploymentId ?? ''),
    }
  }
}
