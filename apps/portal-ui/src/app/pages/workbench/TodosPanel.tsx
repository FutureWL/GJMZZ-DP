import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { getMyWorkflowTasks, type WorkflowTaskListItem } from '../../api/workflow'
import { useAuth } from '../../state/auth/useAuth'
import { Button } from '../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'

export function TodosPanel() {
  const auth = useAuth()
  const [items, setItems] = useState<WorkflowTaskListItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (!auth.token) return
    setIsLoading(true)
    setError(null)
    try {
      const data = await getMyWorkflowTasks(auth.token)
      setItems(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败')
      setItems([])
    } finally {
      setIsLoading(false)
    }
  }, [auth.token])

  useEffect(() => {
    void reload()
  }, [reload])

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>统一待办（Flowable）</CardTitle>
        <Button size="sm" onClick={reload} disabled={!auth.token || isLoading}>
          刷新
        </Button>
      </CardHeader>
      <CardBody>
        {!auth.user?.position ? (
          <div className="text-sm text-[var(--color-text-tertiary)]">未设置岗位（Profile.position），暂无法按岗位聚合待办。</div>
        ) : error ? (
          <div className="text-sm text-[var(--color-text-tertiary)]">{error}</div>
        ) : isLoading ? (
          <div className="text-sm text-[var(--color-text-tertiary)]">加载中…</div>
        ) : !items.length ? (
          <div className="text-sm text-[var(--color-text-tertiary)]">暂无待办</div>
        ) : (
          <div className="space-y-2">
            {items.map((it) => (
              <div
                key={it.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">{it.name || it.id}</div>
                  <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">{it.created}</div>
                </div>
                <Link to={`/workflow/tasks/${encodeURIComponent(it.id)}`} className="text-sm text-[var(--color-primary)] hover:underline">
                  办理
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  )
}

