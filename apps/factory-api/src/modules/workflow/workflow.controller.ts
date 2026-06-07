import { BadRequestException, Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common'
import type { FastifyRequest } from 'fastify'

import { DbService } from '../db/db.service'
import type { WorkflowAction, WorkflowTaskDetail, WorkflowTaskListItem } from './workflow.types'
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

@Controller('workflow')
export class WorkflowController {
  constructor(
    private readonly workflow: WorkflowService,
    private readonly db: DbService,
  ) {}

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

  @Get('instances/by-business-key/:businessKey')
  async getInstanceByBusinessKey(@Param('businessKey') businessKey: string) {
    const key = asNonEmptyString(businessKey, 'businessKey')
    return (await this.workflow.findProcessInstanceByBusinessKey(key)) ?? null
  }

  @Post('instances/by-business-key/:businessKey/start')
  async startInstanceByBusinessKey(@Req() req: RequestWithUser, @Param('businessKey') businessKey: string) {
    const userId = req.user?.sub
    if (!userId) {
      throw new BadRequestException('User not identified')
    }
    const key = asNonEmptyString(businessKey, 'businessKey')
    const processDefinitionKey = process.env.FLOWABLE_QC_EXCEPTION_PROCESS_DEFINITION_KEY ?? 'qc_exception_v1'

    return await this.workflow.startProcessInstanceByKey({
      processDefinitionKey,
      businessKey: key,
      variables: {
        initiatorUserId: userId,
      },
    })
  }

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

  @Get('process-instances/:id/history')
  async history(@Param('id') id: string) {
    const [tasks, activities] = await Promise.all([
      this.workflow.listHistoricTasks(id),
      this.workflow.listHistoricActivities(id),
    ])
    return { tasks, activities }
  }
}

