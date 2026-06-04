import { useMemo, useState } from 'react'
import { alarms as alarmData } from '../../mock/data'
import type { Alarm } from '../../mock/models'
import { Badge } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { Drawer } from '../../ui/Drawer'
import { PageHeader } from '../../ui/PageHeader'
import { Select } from '../../ui/Select'

type Filter = 'all' | 'open' | 'ack' | 'closed'

export function AlarmCenterPage() {
  const [filter, setFilter] = useState<Filter>('all')
  const [selected, setSelected] = useState<Alarm | null>(null)

  const alarms = useMemo(() => {
    if (filter === 'all') return alarmData
    return alarmData.filter((a) => a.status === filter)
  }, [filter])

  return (
    <div>
      <PageHeader
        title="告警中心"
        description="生产域：告警优先；列表 + 详情抽屉（P0演示）"
        right={
          <div className="w-[140px]">
            <Select value={filter} onChange={(e) => setFilter(e.target.value as Filter)}>
              <option value="all">全部</option>
              <option value="open">未确认</option>
              <option value="ack">已确认</option>
              <option value="closed">已关闭</option>
            </Select>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>告警列表</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="overflow-auto">
            <table className="w-full table-auto border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="text-xs text-[var(--color-text-tertiary)]">
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">告警</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">严重度</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">设备</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">产线</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">状态</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">开始时间</th>
                </tr>
              </thead>
              <tbody>
                {alarms.map((a) => (
                  <tr
                    key={a.id}
                    className="cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                    onClick={() => setSelected(a)}
                  >
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <div className="font-medium text-[var(--color-text-primary)]">{a.title}</div>
                      <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">{a.id}</div>
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <Badge tone={a.severity === 'critical' ? 'error' : a.severity === 'high' ? 'error' : a.severity === 'medium' ? 'warning' : 'neutral'}>
                        {a.severity}
                      </Badge>
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{a.equipment}</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{a.line}</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <Badge tone={a.status === 'open' ? 'error' : a.status === 'ack' ? 'warning' : 'success'}>
                        {a.status}
                      </Badge>
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{a.startAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <Drawer
        open={!!selected}
        title={selected ? selected.title : ''}
        onClose={() => setSelected(null)}
      >
        {selected ? (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>告警信息</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                  <div>
                    <div className="text-xs text-[var(--color-text-tertiary)]">告警ID</div>
                    <div className="mt-1 text-[var(--color-text-primary)]">{selected.id}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--color-text-tertiary)]">严重度</div>
                    <div className="mt-1">
                      <Badge tone={selected.severity === 'critical' ? 'error' : selected.severity === 'medium' ? 'warning' : 'neutral'}>
                        {selected.severity}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--color-text-tertiary)]">设备</div>
                    <div className="mt-1 text-[var(--color-text-primary)]">{selected.equipment}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--color-text-tertiary)]">产线</div>
                    <div className="mt-1 text-[var(--color-text-primary)]">{selected.line}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--color-text-tertiary)]">开始时间</div>
                    <div className="mt-1 text-[var(--color-text-primary)]">{selected.startAt}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--color-text-tertiary)]">状态</div>
                    <div className="mt-1">
                      <Badge tone={selected.status === 'open' ? 'error' : selected.status === 'ack' ? 'warning' : 'success'}>
                        {selected.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>处置动作（占位）</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="flex flex-wrap gap-2">
                  <Button variant="primary">确认</Button>
                  <Button variant="secondary">转派</Button>
                  <Button variant="secondary">升级</Button>
                  <Button variant="danger">关闭</Button>
                </div>
                <div className="mt-3 text-sm text-[var(--color-text-tertiary)]">
                  留痕区域：原因/措施/备注/附件位（此处仅界面占位）
                </div>
              </CardBody>
            </Card>
          </div>
        ) : null}
      </Drawer>
    </div>
  )
}

