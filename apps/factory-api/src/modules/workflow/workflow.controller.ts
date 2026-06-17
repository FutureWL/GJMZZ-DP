import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import type { FastifyRequest } from 'fastify'

import { DbService } from '../db/db.service'
import type {
  WorkflowAction,
  WorkflowDeployInput,
  WorkflowProcessDefinition,
  WorkflowStartInput,
  WorkflowTaskDetail,
  WorkflowTaskListItem,
} from './workflow.types'
import { WorkflowService } from './workflow.service'

type RequestWithUser = FastifyRequest & {
  user?: {
    sub?: string
    realm_access?: { roles?: string[] }
  }
}

function asNonEmptyString(v: unknown, field: string) {
  if (typeof v !== 'string' || v.trim().length === 0) {
    throw new BadRequestException(`${field} is required`)
  }
  return v.trim()
}

function parseAction(v: unknown): WorkflowAction {
  if (v === 'APPROVE' || v === 'BACK') return v
  throw new BadRequestException('action is invalid')
}

function parseCompleteBody(body: unknown): { action: WorkflowAction; comment?: string } {
  if (!body || typeof body !== 'object') {
    throw new BadRequestException('Invalid body')
  }
  const b = body as Record<string, unknown>
  const action = parseAction(b.action)
  const comment = typeof b.comment === 'string' && b.comment.trim().length ? b.comment.trim() : undefined
  return { action, comment }
}

function parseStartBody(body: unknown): WorkflowStartInput {
  if (!body || typeof body !== 'object') {
    throw new BadRequestException('Invalid body')
  }
  const b = body as Record<string, unknown>
  const businessKey = asNonEmptyString(b.businessKey, 'businessKey')
  const processDefinitionKey =
    typeof b.processDefinitionKey === 'string' && b.processDefinitionKey.trim().length
      ? b.processDefinitionKey.trim()
      : process.env.FLOWABLE_DEFAULT_PROCESS_DEFINITION_KEY ?? 'simple_approval_v1'
  let variables: Record<string, unknown> | undefined
  if (b.variables && typeof b.variables === 'object') {
    variables = b.variables as Record<string, unknown>
  }
  return { businessKey, processDefinitionKey, variables }
}

function parseDeployBody(body: unknown): WorkflowDeployInput {
  if (!body || typeof body !== 'object') {
    throw new BadRequestException('Invalid body')
  }
  const b = body as Record<string, unknown>
  const name = asNonEmptyString(b.name, 'name')
  const bpmnXml = asNonEmptyString(b.bpmnXml, 'bpmnXml')
  return { name, bpmnXml }
}

@ApiTags('workflow')
@ApiBearerAuth()
@Controller('workflow')
export class WorkflowController {
  private readonly logger = new Logger(WorkflowController.name)

  constructor(
    private readonly workflow: WorkflowService,
    private readonly db: DbService,
  ) {}

  // ========== 任务 ==========

  @ApiOperation({ summary: '我的待办(按 Profile.position 作为 candidateGroup 聚合)' })
  @ApiResponse({ status: 200, description: 'WorkflowTaskListItem[]' })
  @Get('tasks/me')
  async myTasks(
    @Req() req: RequestWithUser,
    @Query() query: Record<string, unknown>,
  ): Promise<WorkflowTaskListItem[]> {
    const userId = req.user?.sub
    if (!userId) {
      throw new BadRequestException('User not identified')
    }

    const res = await this.db.query<{ position: string | null }>(
      'select position from public.profile where user_id = $1 limit 1',
      [userId],
    )
    const position = res.rows[0]?.position?.trim()
    if (!position) return []

    const tenantId = typeof query.tenantId === 'string' && query.tenantId.trim().length ? query.tenantId.trim() : ''
    const groupId = tenantId ? `${tenantId}:${position}` : position

    const tasks = await this.workflow.listCandidateGroupTasks(groupId)
    return tasks.map((t) => ({
      id: String(t.id ?? ''),
      name: String(t.name ?? ''),
      created: String(t.createTime ?? ''),
      assignee: t.assignee === null || t.assignee === undefined ? null : String(t.assignee),
      owner: t.owner === null || t.owner === undefined ? null : String(t.owner),
      processInstanceId: String(t.processInstanceId ?? ''),
    }))
  }

  @ApiOperation({ summary: '任务详情(包含 processInstance 与 businessKey)' })
  @Get('tasks/:id')
  async taskDetail(@Param('id') id: string): Promise<WorkflowTaskDetail> {
    const task = await this.workflow.getTask(id)
    const processInstanceId = typeof task.processInstanceId === 'string' ? task.processInstanceId : null
    if (!processInstanceId) {
      return { task, processInstance: null, businessKey: null }
    }

    const processInstance = await this.workflow.getProcessInstance(processInstanceId)
    const businessKey = typeof processInstance.businessKey === 'string' ? processInstance.businessKey : null
    return { task, processInstance, businessKey }
  }

  @ApiOperation({ summary: '完成任务(body: { action: APPROVE|BACK, comment? })' })
  @Post('tasks/:id/complete')
  async completeTask(@Req() req: RequestWithUser, @Param('id') id: string, @Body() body: unknown) {
    const userId = req.user?.sub
    if (!userId) {
      throw new BadRequestException('User not identified')
    }

    const parsed = parseCompleteBody(body)
    await this.workflow.completeTask({
      taskId: id,
      variables: {
        action: parsed.action,
        comment: parsed.comment ?? '',
        backTo: parsed.action === 'BACK' ? 'INITIATOR' : '',
      },
    })
    return { ok: true }
  }

  // ========== 流程实例 ==========

  @ApiOperation({ summary: '按 businessKey 查流程实例' })
  @Get('instances/by-business-key/:businessKey')
  async getInstanceByBusinessKey(@Param('businessKey') businessKey: string) {
    const key = asNonEmptyString(businessKey, 'businessKey')
    return (await this.workflow.findProcessInstanceByBusinessKey(key)) ?? null
  }

  @ApiOperation({
    summary: '启动流程(L2)',
    description: 'body: { businessKey, processDefinitionKey?, variables? };默认 processDefinitionKey=simple_approval_v1',
  })
  @Post('instances')
  async startInstance(@Req() req: RequestWithUser, @Body() body: unknown) {
    const userId = req.user?.sub
    if (!userId) {
      throw new BadRequestException('User not identified')
    }
    const input = parseStartBody(body)
    this.logger.log(
      `start process: key=${input.processDefinitionKey} businessKey=${input.businessKey} initiator=${userId}`,
    )

    return await this.workflow.startProcessInstanceByKey({
      processDefinitionKey: input.processDefinitionKey!,
      businessKey: input.businessKey,
      variables: {
        ...(input.variables ?? {}),
        initiatorUserId: userId,
      },
    })
  }

  /**
   * 兼容旧端点: /instances/by-business-key/:businessKey/start
   * 默认使用 simple_approval_v1(可通过 env FLOWABLE_DEFAULT_PROCESS_DEFINITION_KEY 调整)
   */
  @Post('instances/by-business-key/:businessKey/start')
  async startInstanceByBusinessKey(@Req() req: RequestWithUser, @Param('businessKey') businessKey: string) {
    const userId = req.user?.sub
    if (!userId) {
      throw new BadRequestException('User not identified')
    }
    const key = asNonEmptyString(businessKey, 'businessKey')
    const processDefinitionKey = process.env.FLOWABLE_DEFAULT_PROCESS_DEFINITION_KEY ?? 'simple_approval_v1'

    return await this.workflow.startProcessInstanceByKey({
      processDefinitionKey,
      businessKey: key,
      variables: {
        initiatorUserId: userId,
      },
    })
  }

  @ApiOperation({ summary: '撤回流程实例' })
  @Post('process-instances/:id/withdraw')
  async withdraw(@Param('id') id: string, @Body() body: unknown) {
    let reason: string | undefined
    if (body && typeof body === 'object') {
      const b = body as Record<string, unknown>
      if (typeof b.reason === 'string' && b.reason.trim().length) reason = b.reason.trim()
    }
    await this.workflow.deleteProcessInstance({ processInstanceId: id, reason })
    return { ok: true }
  }

  @ApiOperation({ summary: '查流程历史(historic-tasks + historic-activities)' })
  @Get('process-instances/:id/history')
  async history(@Param('id') id: string) {
    const [tasks, activities] = await Promise.all([
      this.workflow.listHistoricTasks(id),
      this.workflow.listHistoricActivities(id),
    ])
    return { tasks, activities }
  }

  /**
   * L4:按 businessKey 查 active task(供业务详情页审批按钮调)
   * - 查 process instance(可能已结束 → 返回 null)
   * - 查 process instance 的 active user task
   * - 查 task 的 identity links(候选组/用户),合并进 task.candidateGroups / candidateUsers
   */
  @ApiOperation({ summary: '按 businessKey 查当前 active task(L4,详情页审批用)' })
  @Get('process-instances/by-business-key/:businessKey/active-task')
  async getActiveTaskByBusinessKey(@Param('businessKey') businessKey: string) {
    const key = asNonEmptyString(businessKey, 'businessKey')
    // 优先查 runtime(进行中),查不到时查 historic(已结束)
    let instance: Record<string, unknown> | null = await this.workflow.findProcessInstanceByBusinessKey(key)
    let isHistoric = false
    if (!instance) {
      instance = await this.workflow.findHistoricProcessInstanceByBusinessKey(key)
      isHistoric = true
    }
    if (!instance) {
      return { task: null, processInstance: null, reason: 'no_instance' }
    }
    const processInstanceId = typeof instance.id === 'string' ? instance.id : null
    if (!processInstanceId) {
      return { task: null, processInstance: instance, reason: 'no_instance_id', isHistoric }
    }
    // 已结束的流程不会有 active task,直接返回实例
    if (isHistoric) {
      return { task: null, processInstance: instance, isHistoric: true }
    }
    const task = await this.workflow.getActiveTaskByProcessInstance(processInstanceId)
    if (!task) {
      return { task: null, processInstance: instance, isHistoric: false }
    }
    const taskId = typeof task.id === 'string' ? task.id : null
    if (!taskId) {
      return { task, processInstance: instance }
    }
    const links = await this.workflow.getTaskIdentityLinks(taskId)
    return {
      task: { ...task, candidateGroups: links.groups, candidateUsers: links.users },
      processInstance: instance,
      isHistoric: false,
    }
  }

  // ========== 流程定义(L2 新增) ==========

  @ApiOperation({ summary: '列出已部署的流程定义' })
  @Get('process-definitions')
  async listProcessDefinitions(): Promise<WorkflowProcessDefinition[]> {
    return await this.workflow.listProcessDefinitions()
  }

  @ApiOperation({ summary: '部署流程定义(BPMN XML)' })
  @Post('process-definitions')
  async deployProcessDefinition(@Body() body: unknown): Promise<WorkflowProcessDefinition> {
    const input = parseDeployBody(body)
    this.logger.log(`deploy process definition: name=${input.name} bpmnBytes=${input.bpmnXml.length}`)
    return await this.workflow.deployProcessDefinition(input)
  }
}
