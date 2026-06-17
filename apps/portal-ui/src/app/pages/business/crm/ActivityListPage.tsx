import { Eye, Pencil, Trash2 } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { contacts, crmActivities } from '../../../mock/data'
import { useCrmData } from '../../../state/crm/CrmDataContext'
import { Badge, type Tone } from '../../../ui/Badge'
import { Button } from '../../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../../ui/Card'
import { DataTable, type DataTableColumn } from '../../../ui/DataTable'
import { Drawer } from '../../../ui/Drawer'
import { Input } from '../../../ui/Input'
import { Modal } from '../../../ui/Modal'
import { PageHeader } from '../../../ui/PageHeader'
import { Select } from '../../../ui/Select'

function activityTypeTone(type: string): Tone {
  if (type === 'meeting') return 'info'
  if (type === 'call') return 'success'
  if (type === 'email') return 'neutral'
  return 'warning'
}

function activityStatusTone(status: string): Tone {
  if (status === 'done') return 'success'
  if (status === 'canceled') return 'error'
  return 'info'
}

function nowTs() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function nextActivityId(existingIds: string[]) {
  const nums = existingIds
    .map((id) => /^ACT-(\d+)$/.exec(id)?.[1])
    .filter((x): x is string => !!x)
    .map((x) => Number.parseInt(x, 10))
    .filter((n) => Number.isFinite(n))
  const next = (nums.length ? Math.max(...nums) : 0) + 1
  return `ACT-${String(next).padStart(6, '0')}`
}

const ACTIVITY_TYPES = [
  { value: 'call', label: '电话 (call)' },
  { value: 'meeting', label: '会议 (meeting)' },
  { value: 'email', label: '邮件 (email)' },
  { value: 'visit', label: '拜访 (visit)' },
] as const

const ACTIVITY_STATUSES = [
  { value: 'planned', label: '计划 (planned)' },
  { value: 'in_progress', label: '进行中 (in_progress)' },
  { value: 'done', label: '已完成 (done)' },
  { value: 'canceled', label: '已取消 (canceled)' },
] as const

export function ActivityListPage() {
  const { customers } = useCrmData()
  const customerName = useCallback(
    (id: string) => customers.find((c) => c.id === id)?.name ?? id,
    [customers],
  )
  const contactName = useCallback((id: string | null) => {
    if (!id) return '-'
    return contacts.find((c) => c.id === id)?.name ?? id
  }, [])

  const [page, setPage] = useState(1)
  const [rows, setRows] = useState(() =>
    [...crmActivities].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  )
  const [drawerId, setDrawerId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [formSubject, setFormSubject] = useState('')
  const [formType, setFormType] = useState('call')
  const [formCustomerId, setFormCustomerId] = useState('')
  const [formContactId, setFormContactId] = useState('')
  const [formOwner, setFormOwner] = useState('')
  const [formStatus, setFormStatus] = useState('planned')
  const [formDueAt, setFormDueAt] = useState('')

  const pageSize = 10
  const total = rows.length

  const pageRows = useMemo(() => {
    const startIndex = (page - 1) * pageSize
    return rows.slice(startIndex, startIndex + pageSize)
  }, [page, rows])

  const drawerActivity = useMemo(() => {
    if (!drawerId) return null
    return rows.find((a) => a.id === drawerId) ?? null
  }, [drawerId, rows])

  const editActivity = useMemo(() => {
    if (!editId) return null
    return rows.find((a) => a.id === editId) ?? null
  }, [editId, rows])

  const availableContacts = useMemo(() => {
    if (!formCustomerId) return contacts
    return contacts.filter((c) => c.customerId === formCustomerId)
  }, [formCustomerId])

  const columns = useMemo<DataTableColumn<(typeof pageRows)[number]>[]>(() => {
    return [
      {
        header: '主题',
        accessorKey: 'subject',
        cell: (a) => (
          <div>
            <button
              type="button"
              onClick={() => setDrawerId(a.id)}
              className="font-medium text-[var(--color-primary)] hover:underline"
            >
              {a.subject}
            </button>
            <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">{a.id}</div>
          </div>
        ),
      },
      {
        header: '类型',
        accessorKey: 'type',
        cell: (a) => <Badge tone={activityTypeTone(a.type)}>{a.type}</Badge>,
      },
      {
        header: '客户',
        accessorKey: 'customerId',
        cell: (a) => (
          <Link
            to={`/business/crm/customers/${encodeURIComponent(a.customerId)}`}
            className="text-[var(--color-primary)] hover:underline"
          >
            {customerName(a.customerId)}
          </Link>
        ),
      },
      {
        header: '联系人',
        accessorKey: 'contactId',
        cell: (a) =>
          a.contactId ? (
            <Link
              to={`/business/crm/contacts/${encodeURIComponent(a.contactId)}`}
              className="text-[var(--color-primary)] hover:underline"
            >
              {contactName(a.contactId)}
            </Link>
          ) : (
            '-'
          ),
      },
      { header: '负责人', accessorKey: 'owner' },
      {
        header: '状态',
        accessorKey: 'status',
        cell: (a) => <Badge tone={activityStatusTone(a.status)}>{a.status}</Badge>,
      },
      { header: '计划时间', accessorKey: 'dueAt' },
      {
        header: '操作',
        sticky: 'right',
        widthClassName: 'w-[132px]',
        cell: (a) => (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] text-[var(--color-text-secondary)] hover:bg-black/5 dark:hover:bg-white/5"
              onClick={(e) => {
                e.stopPropagation()
                setDrawerId(a.id)
              }}
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] text-[var(--color-text-secondary)] hover:bg-black/5 dark:hover:bg-white/5"
              onClick={(e) => {
                e.stopPropagation()
                setEditId(a.id)
                setFormSubject(a.subject)
                setFormType(a.type)
                setFormCustomerId(a.customerId)
                setFormContactId(a.contactId ?? '')
                setFormOwner(a.owner)
                setFormStatus(a.status)
                setFormDueAt(a.dueAt)
              }}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] text-[var(--color-status-fault)] hover:bg-black/5 dark:hover:bg-white/5"
              onClick={(e) => {
                e.stopPropagation()
                setDeleteId(a.id)
              }}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ]
  }, [contactName, customerName])

  const resetForm = () => {
    setFormSubject('')
    setFormType('call')
    setFormCustomerId(customers[0]?.id ?? '')
    setFormContactId('')
    setFormOwner('')
    setFormStatus('planned')
    setFormDueAt('')
  }

  return (
    <div>
      <PageHeader title="跟进记录" description="CRM：跟进记录（界面示例）" />
      <Card>
        <CardHeader>
          <CardTitle>跟进记录列表</CardTitle>
          <Button
            variant="primary"
            onClick={() => {
              resetForm()
              setCreateOpen(true)
            }}
          >
            + 新建跟进
          </Button>
        </CardHeader>
        <CardBody>
          <DataTable
            columns={columns}
            data={pageRows}
            emptyText="暂无跟进记录"
            pagination={{
              total,
              page,
              pageSize,
              onPageChange: setPage,
            }}
          />
        </CardBody>
      </Card>

      <Drawer
        open={!!drawerId}
        title={drawerActivity ? `跟进：${drawerActivity.subject}` : '跟进详情'}
        onClose={() => setDrawerId(null)}
      >
        {drawerActivity ? (
          <div className="space-y-4">
            <div className="rounded-[12px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-4">
              <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">记录ID</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{drawerActivity.id}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">类型</div>
                  <div className="mt-1">
                    <Badge tone={activityTypeTone(drawerActivity.type)}>{drawerActivity.type}</Badge>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">客户</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">
                    {customerName(drawerActivity.customerId)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">联系人</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">
                    {contactName(drawerActivity.contactId)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">负责人</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{drawerActivity.owner}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">状态</div>
                  <div className="mt-1">
                    <Badge tone={activityStatusTone(drawerActivity.status)}>{drawerActivity.status}</Badge>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">计划时间</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{drawerActivity.dueAt}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">创建时间</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{drawerActivity.createdAt}</div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </Drawer>

      <Modal
        open={createOpen}
        title="新建跟进记录"
        onClose={() => setCreateOpen(false)}
        confirmDisabled={!formSubject.trim() || !formCustomerId || !formOwner.trim() || !formDueAt.trim()}
        onConfirm={() => {
          setRows((prev) => [
            {
              id: nextActivityId(prev.map((x) => x.id)),
              subject: formSubject.trim(),
              type: formType as 'call' | 'meeting' | 'email' | 'visit',
              customerId: formCustomerId,
              contactId: formContactId || null,
              owner: formOwner.trim(),
              status: formStatus as 'planned' | 'in_progress' | 'done' | 'canceled',
              dueAt: formDueAt.trim(),
              createdAt: nowTs(),
            },
            ...prev,
          ])
          setPage(1)
          setCreateOpen(false)
        }}
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="md:col-span-2">
            <div className="text-xs text-[var(--color-text-tertiary)]">主题</div>
            <div className="mt-1">
              <Input value={formSubject} onChange={(e) => setFormSubject(e.target.value)} placeholder="请输入主题" />
            </div>
          </div>
          <div>
            <div className="text-xs text-[var(--color-text-tertiary)]">类型</div>
            <div className="mt-1">
              <Select value={formType} onChange={(e) => setFormType(e.target.value)}>
                {ACTIVITY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <div className="text-xs text-[var(--color-text-tertiary)]">状态</div>
            <div className="mt-1">
              <Select value={formStatus} onChange={(e) => setFormStatus(e.target.value)}>
                {ACTIVITY_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <div className="text-xs text-[var(--color-text-tertiary)]">所属客户</div>
            <div className="mt-1">
              <Select
                value={formCustomerId}
                onChange={(e) => {
                  setFormCustomerId(e.target.value)
                  setFormContactId('')
                }}
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <div className="text-xs text-[var(--color-text-tertiary)]">联系人（可选）</div>
            <div className="mt-1">
              <Select value={formContactId} onChange={(e) => setFormContactId(e.target.value)}>
                <option value="">不指定</option>
                {availableContacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} · {c.title}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <div className="text-xs text-[var(--color-text-tertiary)]">负责人</div>
            <div className="mt-1">
              <Input value={formOwner} onChange={(e) => setFormOwner(e.target.value)} placeholder="如：销售-赵" />
            </div>
          </div>
          <div>
            <div className="text-xs text-[var(--color-text-tertiary)]">计划时间</div>
            <div className="mt-1">
              <Input value={formDueAt} onChange={(e) => setFormDueAt(e.target.value)} placeholder="如：2026-06-09 10:00" />
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!editId}
        title={editActivity ? `编辑跟进：${editActivity.subject}` : '编辑跟进'}
        onClose={() => setEditId(null)}
        confirmDisabled={!formSubject.trim() || !formCustomerId || !formOwner.trim() || !formDueAt.trim()}
        onConfirm={() => {
          if (!editId) return
          setRows((prev) =>
            prev.map((a) =>
              a.id === editId
                ? {
                    ...a,
                    subject: formSubject.trim(),
                    type: formType as 'call' | 'meeting' | 'email' | 'visit',
                    customerId: formCustomerId,
                    contactId: formContactId || null,
                    owner: formOwner.trim(),
                    status: formStatus as 'planned' | 'in_progress' | 'done' | 'canceled',
                    dueAt: formDueAt.trim(),
                  }
                : a,
            ),
          )
          setEditId(null)
        }}
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="md:col-span-2">
            <div className="text-xs text-[var(--color-text-tertiary)]">主题</div>
            <div className="mt-1">
              <Input value={formSubject} onChange={(e) => setFormSubject(e.target.value)} placeholder="请输入主题" />
            </div>
          </div>
          <div>
            <div className="text-xs text-[var(--color-text-tertiary)]">类型</div>
            <div className="mt-1">
              <Select value={formType} onChange={(e) => setFormType(e.target.value)}>
                {ACTIVITY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <div className="text-xs text-[var(--color-text-tertiary)]">状态</div>
            <div className="mt-1">
              <Select value={formStatus} onChange={(e) => setFormStatus(e.target.value)}>
                {ACTIVITY_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <div className="text-xs text-[var(--color-text-tertiary)]">所属客户</div>
            <div className="mt-1">
              <Select
                value={formCustomerId}
                onChange={(e) => {
                  setFormCustomerId(e.target.value)
                  setFormContactId('')
                }}
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <div className="text-xs text-[var(--color-text-tertiary)]">联系人（可选）</div>
            <div className="mt-1">
              <Select value={formContactId} onChange={(e) => setFormContactId(e.target.value)}>
                <option value="">不指定</option>
                {availableContacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} · {c.title}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <div className="text-xs text-[var(--color-text-tertiary)]">负责人</div>
            <div className="mt-1">
              <Input value={formOwner} onChange={(e) => setFormOwner(e.target.value)} placeholder="如：销售-赵" />
            </div>
          </div>
          <div>
            <div className="text-xs text-[var(--color-text-tertiary)]">计划时间</div>
            <div className="mt-1">
              <Input value={formDueAt} onChange={(e) => setFormDueAt(e.target.value)} placeholder="如：2026-06-09 10:00" />
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!deleteId}
        title="删除跟进记录"
        onClose={() => setDeleteId(null)}
        confirmText="删除"
        onConfirm={() => {
          if (!deleteId) return
          setRows((prev) => prev.filter((a) => a.id !== deleteId))
          setDeleteId(null)
          setDrawerId((prev) => (prev === deleteId ? null : prev))
        }}
      >
        <div className="text-sm text-[var(--color-text-secondary)]">
          确认删除该跟进记录？此操作仅影响当前页面的演示数据。
        </div>
      </Modal>
    </div>
  )
}
