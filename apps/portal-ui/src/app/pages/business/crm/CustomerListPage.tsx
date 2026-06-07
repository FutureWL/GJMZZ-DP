import { Eye, Pencil } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCrmData } from '../../../state/crm/CrmDataContext'
import { DataTable, type DataTableColumn } from '../../../ui/DataTable'
import { Drawer } from '../../../ui/Drawer'
import { Modal } from '../../../ui/Modal'
import { StatusBadge } from '../../../ui/StatusBadge'
import { Button } from '../../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../../ui/Card'
import { Input } from '../../../ui/Input'
import { PageHeader } from '../../../ui/PageHeader'
import { Select } from '../../../ui/Select'

type DrawerTab = 'basic' | 'timeline'

function levelVariant(level: string) {
  if (level === 'A') return 'success'
  if (level === 'B') return 'info'
  return 'default'
}

function statusVariant(status: string) {
  if (status === 'active') return 'success'
  if (status === 'inactive') return 'default'
  return 'default'
}

export function CustomerListPage() {
  const { customers } = useCrmData()
  const [q, setQ] = useState('')
  const [industry, setIndustry] = useState('')
  const [level, setLevel] = useState('')
  const [status, setStatus] = useState('')
  const [sort, setSort] = useState('nextFollowUpAt-asc')
  const [page, setPage] = useState(1)
  const [drawerId, setDrawerId] = useState<string | null>(null)
  const [drawerTab, setDrawerTab] = useState<DrawerTab>('basic')
  const [createOpen, setCreateOpen] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createIndustry, setCreateIndustry] = useState('')
  const [createLevel, setCreateLevel] = useState('A')

  const industries = useMemo(() => {
    return Array.from(new Set(customers.map((c) => c.industry))).sort((a, b) => a.localeCompare(b))
  }, [customers])

  const rows = useMemo(() => {
    const keyword = q.trim().toLowerCase()
    const filtered = customers.filter((c) => {
      if (industry && c.industry !== industry) return false
      if (level && c.level !== level) return false
      if (status && c.status !== status) return false
      if (!keyword) return true
      const haystack = [c.name, c.id, c.industry, c.owner, (c.tags ?? []).join(',')].join(' ').toLowerCase()
      return haystack.includes(keyword)
    })

    const [key, dir] = sort.split('-') as [string, 'asc' | 'desc']
    const factor = dir === 'asc' ? 1 : -1
    const byString = (a: string, b: string) => factor * a.localeCompare(b)

    return filtered.slice().sort((a, b) => {
      if (key === 'name') return byString(a.name, b.name)
      if (key === 'level') return byString(a.level, b.level)
      if (key === 'status') return byString(a.status, b.status)
      if (key === 'lastContactAt') return byString(a.lastContactAt, b.lastContactAt)
      if (key === 'nextFollowUpAt') {
        const aa = a.nextFollowUpAt ?? (dir === 'asc' ? '9999-12-31 23:59' : '')
        const bb = b.nextFollowUpAt ?? (dir === 'asc' ? '9999-12-31 23:59' : '')
        return byString(aa, bb)
      }
      return byString(a.name, b.name)
    })
  }, [customers, industry, level, q, sort, status])

  const pageSize = 10
  const total = 45

  const pageRows = useMemo(() => {
    const startIndex = (page - 1) * pageSize
    return rows.slice(startIndex, startIndex + pageSize)
  }, [page, rows])

  const drawerCustomer = useMemo(() => {
    if (!drawerId) return null
    return customers.find((c) => c.id === drawerId) ?? null
  }, [customers, drawerId])

  const customerColumns = useMemo<DataTableColumn<(typeof pageRows)[number]>[]>(() => {
    return [
      {
        header: '客户',
        accessorKey: 'name',
        cell: (c) => (
          <div>
            <button
              type="button"
              onClick={() => {
                setDrawerId(c.id)
                setDrawerTab('basic')
              }}
              className="font-medium text-[var(--color-primary)] hover:underline"
            >
              {c.name}
            </button>
            <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">{c.id}</div>
          </div>
        ),
      },
      { header: '行业', accessorKey: 'industry' },
      {
        header: '等级',
        accessorKey: 'level',
        cell: (c) => <StatusBadge variant={levelVariant(c.level)}>{c.level}</StatusBadge>,
      },
      { header: '负责人', accessorKey: 'owner' },
      { header: '最近联系', accessorKey: 'lastContactAt' },
      {
        header: '下次跟进',
        accessorKey: 'nextFollowUpAt',
        cell: (c) => (
          <div>
            <div className="text-[var(--color-text-primary)]">{c.nextFollowUpAt ?? '-'}</div>
            {c.nextFollowUpNote ? (
              <div className="mt-1 line-clamp-2 text-xs text-[var(--color-text-tertiary)]">
                {c.nextFollowUpNote}
              </div>
            ) : null}
          </div>
        ),
      },
      {
        header: '状态',
        accessorKey: 'status',
        cell: (c) => <StatusBadge variant={statusVariant(c.status)}>{c.status}</StatusBadge>,
      },
      {
        header: '操作',
        sticky: 'right',
        widthClassName: 'w-[92px]',
        cell: (c) => (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] text-[var(--color-text-secondary)] hover:bg-black/5 dark:hover:bg-white/5"
              onClick={(e) => {
                e.stopPropagation()
                setDrawerId(c.id)
                setDrawerTab('basic')
              }}
            >
              <Eye className="h-4 w-4" />
            </button>
            <Link
              to={`/sales/crm/customers/${encodeURIComponent(c.id)}`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] text-[var(--color-text-secondary)] hover:bg-black/5 dark:hover:bg-white/5"
              onClick={(e) => e.stopPropagation()}
            >
              <Pencil className="h-4 w-4" />
            </Link>
          </div>
        ),
      },
    ]
  }, [])

  return (
    <div>
      <PageHeader title="客户" description="CRM：客户台账（界面示例）" />
      <Card>
        <CardHeader>
          <CardTitle>客户列表</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="flex-1">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="搜索客户/ID/负责人/标签…"
              />
            </div>
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-end">
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                <Select value={industry} onChange={(e) => setIndustry(e.target.value)}>
                  <option value="">全部行业</option>
                  {industries.map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </Select>
                <Select value={level} onChange={(e) => setLevel(e.target.value)}>
                  <option value="">全部等级</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </Select>
                <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="">全部状态</option>
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                </Select>
                <Select value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="nextFollowUpAt-asc">按下次跟进（最近优先）</option>
                  <option value="lastContactAt-desc">按最近联系（最新优先）</option>
                  <option value="name-asc">按名称（A→Z）</option>
                  <option value="level-asc">按等级（A→C）</option>
                </Select>
              </div>
              <Button
                variant="primary"
                onClick={() => {
                  setCreateName('')
                  setCreateIndustry('')
                  setCreateLevel('A')
                  setCreateOpen(true)
                }}
              >
                + 新建客户
              </Button>
            </div>
          </div>
          <DataTable
            columns={customerColumns}
            data={pageRows}
            selectable
            pagination={{
              total,
              page,
              pageSize,
              onPageChange: setPage,
            }}
          />
        </CardBody>
      </Card>

      <Modal
        open={createOpen}
        title="新建客户"
        onClose={() => setCreateOpen(false)}
        onConfirm={() => setCreateOpen(false)}
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <div className="text-xs text-[var(--color-text-tertiary)]">客户名称</div>
            <div className="mt-1">
              <Input value={createName} onChange={(e) => setCreateName(e.target.value)} placeholder="请输入客户名称" />
            </div>
          </div>
          <div>
            <div className="text-xs text-[var(--color-text-tertiary)]">所属行业</div>
            <div className="mt-1">
              <Select value={createIndustry} onChange={(e) => setCreateIndustry(e.target.value)}>
                <option value="">请选择行业</option>
                {industries.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <div className="text-xs text-[var(--color-text-tertiary)]">客户等级</div>
            <div className="mt-1">
              <Select value={createLevel} onChange={(e) => setCreateLevel(e.target.value)}>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </Select>
            </div>
          </div>
          <div>
            <div className="text-xs text-[var(--color-text-tertiary)]">状态（Mock）</div>
            <div className="mt-2">
              <StatusBadge variant="success">active</StatusBadge>
            </div>
          </div>
        </div>
      </Modal>

      <Drawer
        open={!!drawerCustomer}
        title={
          drawerCustomer ? (
            <div className="flex items-center gap-2">
              <span className="truncate">{drawerCustomer.name}</span>
              <StatusBadge variant={statusVariant(drawerCustomer.status)}>{drawerCustomer.status}</StatusBadge>
            </div>
          ) : (
            ''
          )
        }
        onClose={() => setDrawerId(null)}
      >
        {drawerCustomer ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-[var(--color-text-primary)]">
                  {drawerCustomer.name}
                </div>
                <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">{drawerCustomer.id}</div>
              </div>
              <Link
                to={`/sales/crm/customers/${encodeURIComponent(drawerCustomer.id)}`}
                className="h-9 rounded-[6px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-3 text-sm font-medium text-[var(--color-text-primary)] hover:bg-black/5 dark:hover:bg-white/5"
              >
                打开详情页
              </Link>
            </div>

            <div className="flex items-center gap-2 border-b border-[var(--color-border-subtle)]">
              <button
                type="button"
                className={
                  drawerTab === 'basic'
                    ? 'h-9 border-b-2 border-[var(--color-primary)] px-3 text-sm font-medium text-[var(--color-text-primary)]'
                    : 'h-9 px-3 text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]'
                }
                onClick={() => setDrawerTab('basic')}
              >
                基本信息
              </button>
              <button
                type="button"
                className={
                  drawerTab === 'timeline'
                    ? 'h-9 border-b-2 border-[var(--color-primary)] px-3 text-sm font-medium text-[var(--color-text-primary)]'
                    : 'h-9 px-3 text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]'
                }
                onClick={() => setDrawerTab('timeline')}
              >
                跟进动态
              </button>
            </div>

            {drawerTab === 'basic' ? (
              <Card>
                <CardHeader>
                  <CardTitle>基本信息</CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                    <div>
                      <div className="text-xs text-[var(--color-text-tertiary)]">行业</div>
                      <div className="mt-1 text-[var(--color-text-primary)]">{drawerCustomer.industry}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[var(--color-text-tertiary)]">负责人</div>
                      <div className="mt-1 text-[var(--color-text-primary)]">{drawerCustomer.owner}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[var(--color-text-tertiary)]">等级</div>
                      <div className="mt-1">
                        <StatusBadge variant={levelVariant(drawerCustomer.level)}>{drawerCustomer.level}</StatusBadge>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[var(--color-text-tertiary)]">注册资金（Mock）</div>
                      <div className="mt-1 text-[var(--color-text-primary)]">¥ 5,000 万</div>
                    </div>
                    <div className="md:col-span-2">
                      <div className="text-xs text-[var(--color-text-tertiary)]">备注（Mock）</div>
                      <div className="mt-1 text-[var(--color-text-primary)]">
                        重点客户：关注交付风险与付款周期。近期关注报价与订单转化。
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>跟进动态</CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="relative pl-4">
                    <div className="absolute left-[7px] top-1 h-[calc(100%-8px)] w-px bg-[var(--color-border-subtle)]" />
                    {[
                      {
                        at: '2026-06-06 10:40',
                        title: '电话沟通：确认报价范围（Mock）',
                        note: '对方希望本周内给出两版报价，分别含不同交期与质保条款。',
                      },
                      {
                        at: '2026-06-04 16:15',
                        title: '现场拜访：了解项目需求（Mock）',
                        note: '确认关键工艺参数与样件交付节点。',
                      },
                      {
                        at: '2026-06-01 09:20',
                        title: '首次建档：客户信息录入（Mock）',
                        note: '由销售经理创建，后续计划安排技术交流。',
                      },
                    ].map((x) => (
                      <div key={x.at} className="relative pb-4">
                        <div className="absolute left-[-2px] top-1 h-3 w-3 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]" />
                        <div className="text-xs text-[var(--color-text-tertiary)]">{x.at}</div>
                        <div className="mt-1 text-sm font-medium text-[var(--color-text-primary)]">{x.title}</div>
                        <div className="mt-1 text-sm text-[var(--color-text-secondary)]">{x.note}</div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        ) : null}
      </Drawer>
    </div>
  )
}
