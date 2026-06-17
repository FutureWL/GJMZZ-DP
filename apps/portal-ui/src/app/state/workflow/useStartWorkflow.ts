import { useCallback, useState } from 'react'

import { startProcessInstance } from '../../api/workflow'
import { useAuth } from '../auth/useAuth'

/**
 * L3:把业务单据提交时启动 Flowable 流程
 *
 * 用法:
 *   const startWf = useStartWorkflow()
 *   ...
 *   <Button onClick={async () => {
 *     const created = flow.createDraft(...)
 *     flow.submit(created.id)                 // mock 状态机
 *     await startWf.start({                   // 真实启动 Flowable(非阻塞)
 *       businessKey: created.id,
 *       businessType: 'expense_claim',
 *       variables: { amountTotal },
 *     })
 *     nav(...)
 *   }} />
 *
 * 设计要点:
 *   - 不抛错:启动失败时只返回 { ok:false, error },不阻塞 UI 跳转(L4 接入状态同步后,会改为阻塞)
 *   - 静默幂等:同一 businessKey 已有流程时,Flowable 仍会启动新流程(后续 L4 应在 start 前先查)
 *   - token 取自 useAuth;若未登录则跳过
 */
export type BusinessType =
  | 'expense_claim'
  | 'procurement_pr'
  | 'contract_review'
  | 'supplier_entry'
  | 'subcontract_workorder'

export type StartWorkflowInput = {
  businessKey: string
  businessType: BusinessType | string
  processDefinitionKey?: string
  variables?: Record<string, unknown>
}

export type StartWorkflowResult =
  | { ok: true; processInstanceId: string; businessKey: string }
  | { ok: false; error: string; businessKey: string }

export function useStartWorkflow() {
  const auth = useAuth()
  const [isStarting, setIsStarting] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)

  const start = useCallback(
    async (input: StartWorkflowInput): Promise<StartWorkflowResult> => {
      if (!auth.token) {
        // 未登录(开发模式 / AUTH_ENABLED=false)时静默跳过
        return { ok: false, businessKey: input.businessKey, error: 'no_token' }
      }
      setIsStarting(true)
      setLastError(null)
      try {
        const resp = await startProcessInstance(auth.token, {
          businessKey: input.businessKey,
          processDefinitionKey: input.processDefinitionKey,
          variables: {
            businessType: input.businessType,
            ...(input.variables ?? {}),
          },
        })
        const processInstanceId =
          typeof resp?.id === 'string'
            ? resp.id
            : typeof (resp as Record<string, unknown>)?.id === 'string'
              ? String((resp as Record<string, unknown>).id)
              : ''
        return { ok: true, businessKey: input.businessKey, processInstanceId }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        setLastError(msg)
        // eslint-disable-next-line no-console
        console.warn(`[useStartWorkflow] start failed for ${input.businessKey}: ${msg}`)
        return { ok: false, businessKey: input.businessKey, error: msg }
      } finally {
        setIsStarting(false)
      }
    },
    [auth.token],
  )

  return { start, isStarting, lastError }
}
