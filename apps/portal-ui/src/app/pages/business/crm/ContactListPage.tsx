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

function nextContactId(existingIds: string[]) {
  const nums = existingIds
    .map((id) => /^CON-(\d+)$/.exec(id)?.[1])
    .filter((x): x is string => !!x)
    .map((x) => Number.parseInt(x, 10))
    .filter((n) => Number.isFinite(n))
  const next = (nums.length ? Math.max(...nums) : 0) + 1
  return `CON-${String(next).padStart(3, '0')}`
}

export function ContactListPage() {
  const { customers } = useCrmData()
  const customerName = useCallback(
    (id: string) => customers.find((c) => c.id === id)?.name ?? id,
    [customers],
  )
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState(() => [...contacts])
  const [drawerId, setDrawerId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [formName, setFormName] = useState('')
  const [formCustomerId, setFormCustomerId] = useState('')
  const [formTitle, setFormTitle] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formEmail, setFormEmail] = useState('')

  const pageSize = 10
  const total = rows.length

  const pageRows = useMemo(() => {
    const startIndex = (page - 1) * pageSize
    return rows.slice(startIndex, startIndex + pageSize)
  }, [page, rows])

  const drawerContact = useMemo(() => {
    if (!drawerId) return null
    return rows.find((c) => c.id === drawerId) ?? null
  }, [drawerId, rows])

  const relatedActivities = useMemo(() => {
    if (!drawerId) return []
    return crmActivities
      .filter((a) => a.contactId === drawerId)
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [drawerId])

  const editContact = useMemo(() => {
    if (!editId) return null
    return rows.find((c) => c.id === editId) ?? null
  }, [editId, rows])

  const columns = useMemo<DataTableColumn<(typeof pageRows)[number]>[]>(() => {
    return [
      {
        header: '联系人',
        accessorKey: 'name',
        cell: (c) => (
          <div>
            <button
              type="button"
              onClick={() => setDrawerId(c.id)}
              className="font-medium text-[var(--color-primary)] hover:underline"
            >
              {c.name}
            </button>
            <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">{c.id}</div>
          </div>
        ),
      },
      {
        header: '客户',
        accessorKey: 'customerId',
        cell: (c) => (
          <Link
            to={`/business/crm/customers/${encodeURIComponent(c.customerId)}`}
            className="text-[var(--color-primary)] hover:underline"
          >
            {customerName(c.customerId)}
          </Link>
        ),
      },
      { header: '职务', accessorKey: 'title' },
      { header: '电话', accessorKey: 'phone' },
      { header: '邮箱', accessorKey: 'email' },
      { header: '最近联系', accessorKey: 'lastContactAt' },
      {
        header: '操作',
        sticky: 'right',
        widthClassName: 'w-[132px]',
        cell: (c) => (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] text-[var(--color-text-secondary)] hover:bg-black/5 dark:hover:bg-white/5"
              onClick={(e) => {
                e.stopPropagation()
                setDrawerId(c.id)
              }}
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] text-[var(--color-text-secondary)] hover:bg-black/5 dark:hover:bg-white/5"
              onClick={(e) => {
                e.stopPropagation()
                setEditId(c.id)
                setFormName(c.name)
                setFormCustomerId(c.customerId)
                setFormTitle(c.title)
                setFormPhone(c.phone)
                setFormEmail(c.email)
              }}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] text-[var(--color-status-fault)] hover:bg-black/5 dark:hover:bg-white/5"
              onClick={(e) => {
                e.stopPropagation()
                setDeleteId(c.id)
              }}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ]
  }, [customerName])

  return (
    <div>
      <PageHeader title="联系人" description="CRM：联系人（界面示例）" />
      <Card>
        <CardHeader>
          <CardTitle>联系人列表</CardTitle>
          <Button
            variant="primary"
            onClick={() => {
              setFormName('')
              setFormCustomerId(customers[0]?.id ?? '')
              setFormTitle('')
              setFormPhone('')
              setFormEmail('')
              setCreateOpen(true)
            }}
          >
            + 新建联系人
          </Button>
        </CardHeader>
        <CardBody>
          <DataTable
            columns={columns}
            data={pageRows}
            emptyText="暂无联系人"
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
        title={drawerContact ? `联系人：${drawerContact.name}` : '联系人'}
        onClose={() => setDrawerId(null)}
      >
        <div className="space-y-4">
          <div className="rounded-[12px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-4">
            <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">联系人ID</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{drawerContact?.id ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">所属客户</div>
                <div className="mt-1 text-[var(--color-text-primary)]">
                  {drawerContact ? customerName(drawerContact.customerId) : '-'}
                </div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">职务</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{drawerContact?.title ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">最近联系</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{drawerContact?.lastContactAt ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">电话</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{drawerContact?.phone ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-tertiary)]">邮箱</div>
                <div className="mt-1 text-[var(--color-text-primary)]">{drawerContact?.email ?? '-'}</div>
              </div>
            </div>
          </div>

          <div className="rounded-[12px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-4">
            <div className="text-sm font-semibold text-[var(--color-text-primary)]">近期互动</div>
            <div className="mt-3 space-y-2">
              {relatedActivities.map((a) => (
                <div
                  key={a.id}
                  className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-page)] p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-medium text-[var(--color-text-primary)]">{a.subject}</div>
                    <div className="flex items-center gap-2">
                      <Badge tone={activityTypeTone(a.type)}>{a.type}</Badge>
                      <Badge tone={activityStatusTone(a.status)}>{a.status}</Badge>
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                    {a.owner} · 计划 {a.dueAt} · 创建 {a.createdAt}
                  </div>
                </div>
              ))}
              {relatedActivities.length === 0 ? (
                <div className="text-sm text-[var(--color-text-tertiary)]">暂无互动记录</div>
              ) : null}
            </div>
          </div>
        </div>
      </Drawer>

      <Modal
        open={createOpen}
        title="新建联系人"
        onClose={() => setCreateOpen(false)}
        confirmDisabled={!formName.trim() || !formCustomerId}
        onConfirm={() => {
          const now = new Date()
          const ts = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
          setRows((prev) => [
            {
              id: nextContactId(prev.map((x) => x.id)),
              customerId: formCustomerId,
              name: formName.trim(),
              title: formTitle.trim() || '-',
              phone: formPhone.trim() || '-',
              email: formEmail.trim() || '-',
              lastContactAt: ts,
            },
            ...prev,
          ])
          setPage(1)
          setCreateOpen(false)
        }}
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="md:col-span-2">
            <div className="text-xs text-[var(--color-text-tertiary)]">联系人姓名</div>
            <div className="mt-1">
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="请输入联系人姓名" />
            </div>
          </div>
          <div>
            <div className="text-xs text-[var(--color-text-tertiary)]">所属客户</div>
            <div className="mt-1">
              <Select value={formCustomerId} onChange={(e) => setFormCustomerId(e.target.value)}>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <div className="text-xs text-[var(--color-text-tertiary)]">职务</div>
            <div className="mt-1">
              <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="如：采购经理" />
            </div>
          </div>
          <div>
            <div className="text-xs text-[var(--color-text-tertiary)]">电话</div>
            <div className="mt-1">
              <Input value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="请输入电话" />
            </div>
          </div>
          <div>
            <div className="text-xs text-[var(--color-text-tertiary)]">邮箱</div>
            <div className="mt-1">
              <Input value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="请输入邮箱" />
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!editId}
        title={editContact ? `编辑联系人：${editContact.name}` : '编辑联系人'}
        onClose={() => setEditId(null)}
        confirmDisabled={!formName.trim() || !formCustomerId}
        onConfirm={() => {
          if (!editId) return
          setRows((prev) =>
            prev.map((c) =>
              c.id === editId
                ? {
                    ...c,
                    customerId: formCustomerId,
                    name: formName.trim(),
                    title: formTitle.trim() || '-',
                    phone: formPhone.trim() || '-',
                    email: formEmail.trim() || '-',
                  }
                : c,
            ),
          )
          setEditId(null)
        }}
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="md:col-span-2">
            <div className="text-xs text-[var(--color-text-tertiary)]">联系人姓名</div>
            <div className="mt-1">
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="请输入联系人姓名" />
            </div>
          </div>
          <div>
            <div className="text-xs text-[var(--color-text-tertiary)]">所属客户</div>
            <div className="mt-1">
              <Select value={formCustomerId} onChange={(e) => setFormCustomerId(e.target.value)}>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <div className="text-xs text-[var(--color-text-tertiary)]">职务</div>
            <div className="mt-1">
              <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="如：采购经理" />
            </div>
          </div>
          <div>
            <div className="text-xs text-[var(--color-text-tertiary)]">电话</div>
            <div className="mt-1">
              <Input value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="请输入电话" />
            </div>
          </div>
          <div>
            <div className="text-xs text-[var(--color-text-tertiary)]">邮箱</div>
            <div className="mt-1">
              <Input value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="请输入邮箱" />
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!deleteId}
        title="删除联系人"
        onClose={() => setDeleteId(null)}
        confirmText="删除"
        onConfirm={() => {
          if (!deleteId) return
          setRows((prev) => prev.filter((c) => c.id !== deleteId))
          setDeleteId(null)
          setDrawerId((prev) => (prev === deleteId ? null : prev))
        }}
      >
        <div className="text-sm text-[var(--color-text-secondary)]">
          确认删除该联系人？此操作仅影响当前页面的演示数据。
        </div>
      </Modal>
    </div>
  )
}
