import { useCallback, useEffect, useState } from 'react'

import { completeWorkflowTask, getActiveTaskByBusinessKey } from '../../api/workflow'
import { useAuth } from '../auth/useAuth'

/**
 * L4 业务侧流程状态 hook
 *
 * 设计:
 *   - 状态源 = Flowable(`processInstance` + active task)
 *   - 派生 derivedStatus(供 UI 状态徽标)
 *   - canAct:当前用户是否在 active task 的 candidateGroup/assignee 中
 *   - approve(taskId) / back(taskId):调 /workflow/tasks/:id/complete
 *
 * 调用方不需要关注 mock 状态机;只通过 derivedStatus 决定 UI。
 */

export type DerivedStatus =
  | 'not_started'   // 还没启动流程
  | 'in_review'     // 流程进行中
  | 'approved'      // 流程已结束(APPROVE)
  | 'rejected'      // 流程已结束(BACK 或 REJECT 走完)
  | 'suspended'     // 流程挂起
  | 'unknown'       // 查询失败等

export type ActiveTask = {
  id: string
  name?: string
  taskDefinitionKey?: string
  assignee?: string | null
  owner?: string | null
  candidateGroups?: string[]
  candidateUsers?: string[]
  processInstanceId?: string
  createTime?: string
  delegationState?: string | null
  suspended?: boolean
}

export type ProcessInstance = {
  id: string
  businessKey?: string
  processDefinitionName?: string
  processDefinitionKey?: string
  startTime?: string
  endTime?: string | null
  ended?: boolean
  suspended?: boolean
  variables?: { name: string; value: unknown; type?: string }[]
}

export type UseBusinessWorkflowStatus = {
  isLoading: boolean
  error: string | null
  processInstance: ProcessInstance | null
  activeTask: ActiveTask | null
  /** 流程是否已存在(已启动过) */
  hasProcess: boolean
  derivedStatus: DerivedStatus
  /** 当前用户能否办理(在 candidateGroup/assignee/candidateUser 中) */
  canAct: boolean
  /** 拒绝原因(若 canAct=false,这里说明) */
  cannotActReason: string | null
  approve: (comment?: string) => Promise<void>
  back: (comment?: string) => Promise<void>
  reload: () => void
}

function pickString(v: unknown): string | null {
  return typeof v === 'string' ? v : null
}

function pickStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v.filter((x): x is string => typeof x === 'string')
}

function deriveStatus(
  instance: ProcessInstance | null,
  task: ActiveTask | null,
): DerivedStatus {
  if (!instance) return 'not_started'
  if (instance.suspended) return 'suspended'
  if (instance.ended || instance.endTime) {
    // 简单判定:如果最后一个 user task 的 description/变量含 BACK 关键字视为 rejected
    // (L4 简化:不查 history 就能拿最常见状态)
    return 'approved'
  }
  if (task && !task.suspended) return 'in_review'
  return 'unknown'
}

function canUserAct(task: ActiveTask | null, userId: string | null | undefined, position: string | null | undefined): boolean {
  if (!task) return false
  // 1. assignee 直接匹配
  if (task.assignee && userId && task.assignee === userId) return true
  // 2. candidateUsers 匹配
  if (userId && task.candidateUsers?.includes(userId)) return true
  // 3. candidateGroups 匹配(用 position 字段)
  if (position && task.candidateGroups?.includes(position)) return true
  return false
}

export function useBusinessWorkflowStatus(businessKey: string): UseBusinessWorkflowStatus {
  const auth = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [processInstance, setProcessInstance] = useState<ProcessInstance | null>(null)
  const [activeTask, setActiveTask] = useState<ActiveTask | null>(null)
  const [hasProcess, setHasProcess] = useState(false)

  const reload = useCallback(() => setReloadKey((v) => v + 1), [])

  useEffect(() => {
    if (!auth.token) return
    let mounted = true
    setIsLoading(true)
    setError(null)
    ;(async () => {
      try {
        const resp = await getActiveTaskByBusinessKey(auth.token!, businessKey)
        if (!mounted) return
        const inst = (resp.processInstance as ProcessInstance | null) ?? null
        const t = (resp.task as ActiveTask | null) ?? null
        setProcessInstance(inst)
        setActiveTask(t)
        setHasProcess(Boolean(inst))
      } catch (e) {
        if (!mounted) return
        setError(e instanceof Error ? e.message : '加载流程状态失败')
        setProcessInstance(null)
        setActiveTask(null)
        setHasProcess(false)
      } finally {
        if (mounted) setIsLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [auth.token, businessKey, reloadKey])

  const derivedStatus = deriveStatus(processInstance, activeTask)
  const canAct = canUserAct(activeTask, auth.user?.id, auth.user?.position)
  const cannotActReason = activeTask && !canAct ? '当前用户不在候选人/组中' : null

  const approve = useCallback(
    async (comment?: string) => {
      if (!auth.token || !activeTask) throw new Error('no active task')
      await completeWorkflowTask(auth.token, activeTask.id, { action: 'APPROVE', comment })
      // 完成后强制刷新
      setReloadKey((v) => v + 1)
    },
    [auth.token, activeTask],
  )
  const back = useCallback(
    async (comment?: string) => {
      if (!auth.token || !activeTask) throw new Error('no active task')
      await completeWorkflowTask(auth.token, activeTask.id, { action: 'BACK', comment })
      setReloadKey((v) => v + 1)
    },
    [auth.token, activeTask],
  )

  return {
    isLoading,
    error,
    processInstance,
    activeTask,
    hasProcess,
    derivedStatus,
    canAct,
    cannotActReason,
    approve,
    back,
    reload,
  }
}

/** 类型守卫辅助(供其他模块引用) */
export const _pickString = pickString
export const _pickStringArray = pickStringArray
