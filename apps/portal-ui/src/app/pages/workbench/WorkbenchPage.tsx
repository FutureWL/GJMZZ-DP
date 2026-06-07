import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../ui/PageHeader'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'
import { TodosPanel } from './TodosPanel'

type WorkbenchTab = 'todos' | 'messages' | 'dashboard'

export function WorkbenchPage() {
  const nav = useNavigate()
  const [tab, setTab] = useState<WorkbenchTab>('todos')
  const [copilot, setCopilot] = useState('')

  const quickLinks = useMemo(
    () => [
      { label: '异常中心', to: '/production/incidents' },
      { label: '采购 PR/PO', to: '/management/procurement/pr' },
      { label: '工单', to: '/production/workorders' },
      { label: '客户', to: '/business/crm/customers' },
    ],
    [],
  )

  return (
    <div>
      <PageHeader
        title="我的工作台"
        description="统一待办、消息告警与角色驾驶舱入口。"
        right={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => nav('/management/approval')}>
              去审批
            </Button>
            <Button variant="primary" size="sm" onClick={() => nav('/production/overview')}>
              去生产总览
            </Button>
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button variant={tab === 'todos' ? 'primary' : 'secondary'} size="sm" onClick={() => setTab('todos')}>
          待办
        </Button>
        <Button variant={tab === 'messages' ? 'primary' : 'secondary'} size="sm" onClick={() => setTab('messages')}>
          消息告警
        </Button>
        <Button variant={tab === 'dashboard' ? 'primary' : 'secondary'} size="sm" onClick={() => setTab('dashboard')}>
          驾驶舱
        </Button>
      </div>

      {tab === 'todos' ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <TodosPanel />
          <Card>
            <CardHeader>
              <CardTitle>常用入口</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="flex flex-col gap-2">
                {quickLinks.map((x) => (
                  <Button key={x.to} onClick={() => nav(x.to)}>
                    {x.label}
                  </Button>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      ) : null}

      {tab === 'messages' ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>统一消息 / 告警（示例）</CardTitle>
              <Button size="sm" onClick={() => nav('/production/alarms')}>
                打开告警中心
              </Button>
            </CardHeader>
            <CardBody>
              <ul className="list-disc space-y-2 pl-5 text-sm text-[var(--color-text-secondary)]">
                <li>设备告警：产线A 温度异常</li>
                <li>交付风险：工单 WO-10023 预计延期</li>
                <li>系统通知：制度流程更新</li>
              </ul>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>AI 业务助理</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="text-sm text-[var(--color-text-tertiary)]">第一版先作为全局搜索增强入口。</div>
              <div className="mt-3 flex gap-2">
                <Input
                  value={copilot}
                  onChange={(e) => setCopilot(e.target.value)}
                  placeholder="例如：近7天一厂刀具采购进度"
                />
                <Button
                  variant="primary"
                  onClick={() => nav(`/search?q=${encodeURIComponent(copilot.trim())}`)}
                  disabled={!copilot.trim()}
                >
                  搜索
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      ) : null}

      {tab === 'dashboard' ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>角色驾驶舱（示例）</CardTitle>
              <Button size="sm" onClick={() => nav('/business/dashboard')}>
                打开经营驾驶舱
              </Button>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                  <div className="text-xs text-[var(--color-text-tertiary)]">产能利用率</div>
                  <div className="mt-1 text-lg font-semibold text-[var(--color-text-primary)]">—</div>
                </div>
                <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                  <div className="text-xs text-[var(--color-text-tertiary)]">交付风险</div>
                  <div className="mt-1 text-lg font-semibold text-[var(--color-text-primary)]">—</div>
                </div>
                <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                  <div className="text-xs text-[var(--color-text-tertiary)]">异常未关闭</div>
                  <div className="mt-1 text-lg font-semibold text-[var(--color-text-primary)]">—</div>
                </div>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>导航建议</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="text-sm text-[var(--color-text-secondary)]">
                左侧菜单按价值链分组，页面路径暂时保持不变，后续再逐步做页面合并与瘦身。
              </div>
            </CardBody>
          </Card>
        </div>
      ) : null}
    </div>
  )
}
