import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMemo, useState } from 'react'
import type {
  AdditionalCenterId,
  AdditionalContent,
  AdditionalContentType,
  AdditionalRequest,
  AdditionalRequestStatus,
  AdditionalRoleId,
} from '../../mock/models'
import { CENTER_PATH } from '../../mock/additional'
import { useAuth } from '../../state/auth/useAuth'
import { useAdditionalData } from '../../state/additional/AdditionalDataContext'
import { Badge, type Tone } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { Input } from '../../ui/Input'
import { PageHeader } from '../../ui/PageHeader'
import { Select } from '../../ui/Select'
import { Textarea } from '../../ui/Textarea'

function isCenterId(value: string | undefined): value is AdditionalCenterId {
  return value === 'tdc' || value === 'party' || value === 'union' || value === 'women'
}

function requestStatusTone(status: AdditionalRequestStatus): Tone {
  if (status === 'done') return 'success'
  if (status === 'rejected' || status === 'canceled') return 'error'
  if (status === 'in_progress') return 'warning'
  if (status === 'accepted') return 'info'
  if (status === 'submitted') return 'neutral'
  return 'neutral'
}

function requestStatusText(status: AdditionalRequestStatus) {
  if (status === 'submitted') return '已提交'
  if (status === 'accepted') return '已受理'
  if (status === 'in_progress') return '处理中'
  if (status === 'done') return '已完成'
  if (status === 'rejected') return '已驳回'
  if (status === 'canceled') return '已撤回'
  return '草稿'
}

function buildCenterTitle(centerId: AdditionalCenterId) {
  if (centerId === 'tdc') return '人才发展中心'
  if (centerId === 'party') return '党群'
  if (centerId === 'union') return '工会'
  return '妇联'
}

export function AdditionalHomePage() {
  const auth = useAuth()
  const { centers, contents, requests } = useAdditionalData()
  const userName = auth.user?.name ?? '未登录'

  const myOpen = useMemo(
    () =>
      requests.filter(
        (r) =>
          r.applicant === userName &&
          r.status !== 'done' &&
          r.status !== 'rejected' &&
          r.status !== 'canceled',
      ).length,
    [requests, userName],
  )

  const pinnedNotices = useMemo(() => {
    const list = contents.filter((c) => c.type === 'notice').sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    return list.slice(0, 6)
  }, [contents])

  return (
    <div>
      <PageHeader title="附加门户" description="专项服务入口：人才发展中心 / 党群 / 工会 / 妇联" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>我的待办</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-semibold text-[var(--color-text-primary)]">{myOpen}</div>
            <div className="mt-2 text-sm text-[var(--color-text-tertiary)]">未结案申请</div>
            <div className="mt-3">
              <Link className="text-sm text-[var(--color-primary)] hover:underline" to="/additional/requests">
                查看我的申请
              </Link>
            </div>
          </CardBody>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>最新通知</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {pinnedNotices.map((n) => (
                <div
                  key={n.id}
                  className="flex items-center justify-between gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">{n.title}</div>
                    <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                      {buildCenterTitle(n.centerId)} · {n.createdAt}
                    </div>
                  </div>
                  <div className="text-xs text-[var(--color-text-tertiary)]">通知</div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>专项中心入口</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {centers.map((c) => (
                <Link
                  key={c.id}
                  to={CENTER_PATH[c.id]}
                  className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-4 hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <div className="text-sm font-semibold text-[var(--color-text-primary)]">{c.name}</div>
                  <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">{c.description}</div>
                </Link>
              ))}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>办理指引（MVP）</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2 text-sm text-[var(--color-text-secondary)]">
              <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                1）进入专项中心 → 选择事项 → 填写并提交
              </div>
              <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                2）进入“我的申请”查看进度与补充材料
              </div>
              <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                3）专员后台在线受理、处理、结案，全程留痕
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export function AdditionalCenterPage() {
  const { center } = useParams()
  const { centers, contents, services } = useAdditionalData()

  if (!isCenterId(center)) {
    return (
      <div>
        <PageHeader title="专项中心" description="参数错误" />
      </div>
    )
  }

  const meta = centers.find((c) => c.id === center)
  const centerServices = services.filter((s) => s.centerId === center && s.enabled)
  const latestNotices = contents
    .filter((c) => c.centerId === center && c.type === 'notice')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5)

  return (
    <div>
      <PageHeader title={meta?.name ?? buildCenterTitle(center)} description={meta?.description ?? ''} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>常用事项</CardTitle>
          </CardHeader>
          <CardBody>
            {centerServices.length ? (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {centerServices.map((s) => (
                  <Link
                    key={s.id}
                    to={`/additional/${center}/services/${encodeURIComponent(s.id)}`}
                    className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-4 hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    <div className="text-sm font-semibold text-[var(--color-text-primary)]">{s.name}</div>
                    <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">{s.category}</div>
                    <div className="mt-2 text-xs text-[var(--color-text-secondary)]">{s.description}</div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-sm text-[var(--color-text-tertiary)]">暂无可用事项</div>
            )}
            <div className="mt-3 flex items-center gap-3">
              <Link className="text-sm text-[var(--color-primary)] hover:underline" to={`/additional/${center}/services`}>
                查看全部事项
              </Link>
              <Link className="text-sm text-[var(--color-primary)] hover:underline" to={`/additional/${center}/requests`}>
                我的申请
              </Link>
              <Link className="text-sm text-[var(--color-primary)] hover:underline" to={`/additional/${center}/content/notice`}>
                通知
              </Link>
              <Link className="text-sm text-[var(--color-primary)] hover:underline" to={`/additional/${center}/content/policy`}>
                制度
              </Link>
              <Link className="text-sm text-[var(--color-primary)] hover:underline" to={`/additional/${center}/content/faq`}>
                FAQ
              </Link>
              <Link className="text-sm text-[var(--color-primary)] hover:underline" to={`/additional/${center}/admin`}>
                专员后台
              </Link>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>最新通知</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {latestNotices.length ? (
                latestNotices.map((n) => (
                  <div
                    key={n.id}
                    className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3"
                  >
                    <div className="text-sm font-medium text-[var(--color-text-primary)]">{n.title}</div>
                    <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">{n.createdAt}</div>
                    <div className="mt-2 text-xs text-[var(--color-text-secondary)]">{n.body}</div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-[var(--color-text-tertiary)]">暂无通知</div>
              )}
            </div>
            <div className="mt-3 text-xs text-[var(--color-text-tertiary)]">
              联系人：{meta?.contactName ?? '-'} · {meta?.contactEmail ?? '-'}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export function AdditionalServiceListPage() {
  const { center } = useParams()
  const { services } = useAdditionalData()

  if (!isCenterId(center)) {
    return (
      <div>
        <PageHeader title="事项目录" description="参数错误" />
      </div>
    )
  }

  const rows = services.filter((s) => s.centerId === center).sort((a, b) => a.category.localeCompare(b.category))

  return (
    <div>
      <PageHeader title={`${buildCenterTitle(center)} · 事项目录`} description="可办理事项清单（示例）" />
      <Card>
        <CardHeader>
          <CardTitle>全部事项</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="overflow-auto">
            <table className="w-full table-auto border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="text-xs text-[var(--color-text-tertiary)]">
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">事项</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">分类</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">属性</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">状态</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">操作</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => (
                  <tr key={s.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <div className="font-medium text-[var(--color-text-primary)]">{s.name}</div>
                      <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">{s.description}</div>
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{s.category}</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      {s.requireApproval ? <Badge tone="info">需审核</Badge> : <Badge tone="neutral">免审核</Badge>}
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      {s.enabled ? <Badge tone="success">启用</Badge> : <Badge tone="warning">停用</Badge>}
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <Link
                        className="text-sm text-[var(--color-primary)] hover:underline"
                        to={`/additional/${center}/services/${encodeURIComponent(s.id)}`}
                      >
                        查看
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

export function AdditionalServiceDetailPage() {
  const { center, serviceId } = useParams()
  const { services } = useAdditionalData()

  if (!isCenterId(center)) {
    return (
      <div>
        <PageHeader title="事项详情" description="参数错误" />
      </div>
    )
  }

  const service = services.find((s) => s.id === serviceId && s.centerId === center)

  return (
    <div>
      <PageHeader title={service ? `事项：${service.name}` : '事项详情'} description={`${buildCenterTitle(center)} · 办理说明`} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>办理说明</CardTitle>
          </CardHeader>
          <CardBody>
            {service ? (
              <div className="space-y-3 text-sm text-[var(--color-text-secondary)]">
                <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                  <div className="text-xs text-[var(--color-text-tertiary)]">分类</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{service.category}</div>
                </div>
                <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                  <div className="text-xs text-[var(--color-text-tertiary)]">说明</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{service.description}</div>
                </div>
                <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                  <div className="text-xs text-[var(--color-text-tertiary)]">是否审核</div>
                  <div className="mt-1 text-[var(--color-text-primary)]">{service.requireApproval ? '需要专员审核' : '提交即受理'}</div>
                </div>
                <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                  <div className="text-xs text-[var(--color-text-tertiary)]">材料/字段</div>
                  <div className="mt-2 space-y-1">
                    {service.formSchema.map((f) => (
                      <div key={f.key} className="text-[var(--color-text-primary)]">
                        {f.label}
                        {f.required ? '（必填）' : ''}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-[var(--color-text-tertiary)]">事项不存在</div>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>发起办理</CardTitle>
          </CardHeader>
          <CardBody>
            {service ? (
              <div className="space-y-3">
                {service.enabled ? (
                  <Link to={`/additional/${center}/apply/${encodeURIComponent(service.id)}`}>
                    <Button variant="primary" className="w-full">
                      立即发起
                    </Button>
                  </Link>
                ) : (
                  <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3 text-sm text-[var(--color-text-tertiary)]">
                    该事项当前停用
                  </div>
                )}
                <Link className="text-sm text-[var(--color-primary)] hover:underline" to={`/additional/${center}/requests`}>
                  查看我的申请
                </Link>
              </div>
            ) : (
              <div className="text-sm text-[var(--color-text-tertiary)]">-</div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export function AdditionalApplyPage() {
  const { center, serviceId } = useParams()
  const auth = useAuth()
  const navigate = useNavigate()
  const { services, createRequest } = useAdditionalData()
  const userName = auth.user?.name ?? '未登录'

  if (!isCenterId(center)) {
    return (
      <div>
        <PageHeader title="发起办理" description="参数错误" />
      </div>
    )
  }

  const service = services.find((s) => s.id === serviceId && s.centerId === center)
  const [form, setForm] = useState<Record<string, string>>({})

  const onSubmit = () => {
    if (!service) return
    const req = createRequest({
      centerId: center,
      serviceId: service.id,
      applicant: userName,
      formData: form,
    })
    navigate(`/additional/requests/${encodeURIComponent(req.id)}`)
  }

  const missingKeys = useMemo(() => {
    if (!service) return []
    return service.formSchema.filter((f) => f.required && !String(form[f.key] ?? '').trim()).map((f) => f.key)
  }, [form, service])

  return (
    <div>
      <PageHeader title={service ? `发起：${service.name}` : '发起办理'} description={`${buildCenterTitle(center)} · 在线办理`} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>申请信息</CardTitle>
          </CardHeader>
          <CardBody>
            {service ? (
              <div className="space-y-3">
                {service.formSchema.map((f) => (
                  <div key={f.key}>
                    <div className="mb-1 text-xs text-[var(--color-text-tertiary)]">
                      {f.label}
                      {f.required ? '（必填）' : ''}
                    </div>
                    <Input
                      value={form[f.key] ?? ''}
                      placeholder={f.placeholder}
                      onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    />
                    {missingKeys.includes(f.key) ? (
                      <div className="mt-1 text-xs text-[var(--color-status-fault)]">请填写该字段</div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-[var(--color-text-tertiary)]">事项不存在</div>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>提交</CardTitle>
          </CardHeader>
          <CardBody>
            {service ? (
              <div className="space-y-3">
                <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3 text-sm text-[var(--color-text-secondary)]">
                  申请人：{userName}
                </div>
                <Button variant="primary" className="w-full" disabled={!service.enabled || missingKeys.length > 0} onClick={onSubmit}>
                  提交申请
                </Button>
                {!service.enabled ? (
                  <div className="text-xs text-[var(--color-text-tertiary)]">事项已停用，无法提交</div>
                ) : null}
                <Link className="text-sm text-[var(--color-primary)] hover:underline" to={`/additional/${center}/services/${encodeURIComponent(service.id)}`}>
                  返回事项详情
                </Link>
              </div>
            ) : (
              <div className="text-sm text-[var(--color-text-tertiary)]">-</div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export function AdditionalRequestsPage() {
  const { center } = useParams()
  const auth = useAuth()
  const { requests } = useAdditionalData()
  const userName = auth.user?.name ?? '未登录'

  const filtered = useMemo(() => {
    const base = requests.filter((r) => r.applicant === userName)
    if (isCenterId(center)) return base.filter((r) => r.centerId === center)
    return base
  }, [center, requests, userName])

  const title = isCenterId(center) ? `${buildCenterTitle(center)} · 我的申请` : '我的申请'

  return (
    <div>
      <PageHeader title={title} description="在线办理记录与状态跟踪" />
      <Card>
        <CardHeader>
          <CardTitle>申请列表</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="overflow-auto">
            <table className="w-full table-auto border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="text-xs text-[var(--color-text-tertiary)]">
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">申请单</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">中心</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">事项</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">状态</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">更新时间</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <div className="font-medium text-[var(--color-text-primary)]">{r.id}</div>
                      <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">{r.createdAt}</div>
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{buildCenterTitle(r.centerId)}</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{r.serviceName}</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <Badge tone={requestStatusTone(r.status)}>{requestStatusText(r.status)}</Badge>
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{r.updatedAt}</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <Link className="text-sm text-[var(--color-primary)] hover:underline" to={`/additional/requests/${encodeURIComponent(r.id)}`}>
                        查看
                      </Link>
                    </td>
                  </tr>
                ))}
                {!filtered.length ? (
                  <tr>
                    <td className="px-3 py-6 text-sm text-[var(--color-text-tertiary)]" colSpan={6}>
                      暂无申请记录
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

export function AdditionalRequestDetailPage() {
  const { id } = useParams()
  const auth = useAuth()
  const { requests, services, updateRequestStatus } = useAdditionalData()
  const userName = auth.user?.name ?? '未登录'

  const req = requests.find((r) => r.id === id)
  const service = services.find((s) => s.id === req?.serviceId)
  const canCancel = req && req.applicant === userName && (req.status === 'submitted' || req.status === 'accepted')

  const cancel = () => {
    if (!req) return
    updateRequestStatus({ requestId: req.id, status: 'canceled', actor: userName, note: '申请人撤回' })
  }

  return (
    <div>
      <PageHeader title={req ? `申请单：${req.id}` : '申请单详情'} description="状态、材料、流转记录" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>申请信息</CardTitle>
          </CardHeader>
          <CardBody>
            {req ? (
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <div className="text-xs text-[var(--color-text-tertiary)]">中心</div>
                    <div className="mt-1 text-[var(--color-text-primary)]">{buildCenterTitle(req.centerId)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--color-text-tertiary)]">事项</div>
                    <div className="mt-1 text-[var(--color-text-primary)]">{req.serviceName}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--color-text-tertiary)]">状态</div>
                    <div className="mt-1">
                      <Badge tone={requestStatusTone(req.status)}>{requestStatusText(req.status)}</Badge>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--color-text-tertiary)]">当前处理人</div>
                    <div className="mt-1 text-[var(--color-text-primary)]">{req.currentAssignee ?? '-'}</div>
                  </div>
                </div>

                <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                  <div className="text-xs text-[var(--color-text-tertiary)]">提交内容</div>
                  <div className="mt-2 space-y-2">
                    {(service?.formSchema ?? []).map((f) => (
                      <div key={f.key} className="flex items-start justify-between gap-3">
                        <div className="text-[var(--color-text-tertiary)]">{f.label}</div>
                        <div className="text-right text-[var(--color-text-primary)]">{req.formData[f.key] || '-'}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                  <div className="text-xs text-[var(--color-text-tertiary)]">流转记录</div>
                  <div className="mt-2 space-y-2">
                    {req.timeline.map((t, idx) => (
                      <div key={`${t.at}-${idx}`} className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-medium text-[var(--color-text-primary)]">{t.action}</div>
                          <div className="text-xs text-[var(--color-text-tertiary)]">{t.at}</div>
                        </div>
                        <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">{t.actor}</div>
                        {t.note ? <div className="mt-2 text-sm text-[var(--color-text-secondary)]">{t.note}</div> : null}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-[var(--color-text-tertiary)]">申请单不存在</div>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>操作</CardTitle>
          </CardHeader>
          <CardBody>
            {req ? (
              <div className="space-y-3">
                <Link className="text-sm text-[var(--color-primary)] hover:underline" to={CENTER_PATH[req.centerId]}>
                  返回中心
                </Link>
                <Link className="text-sm text-[var(--color-primary)] hover:underline" to={`/additional/${req.centerId}/services/${encodeURIComponent(req.serviceId)}`}>
                  查看事项
                </Link>
                {canCancel ? (
                  <Button variant="danger" className="w-full" onClick={cancel}>
                    撤回申请
                  </Button>
                ) : (
                  <div className="text-xs text-[var(--color-text-tertiary)]">撤回仅支持“已提交/已受理”状态</div>
                )}
              </div>
            ) : (
              <div className="text-sm text-[var(--color-text-tertiary)]">-</div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export function AdditionalAdminHomePage() {
  const { center } = useParams()
  const { centers, requests, services } = useAdditionalData()

  if (!isCenterId(center)) {
    return (
      <div>
        <PageHeader title="专员后台" description="参数错误" />
      </div>
    )
  }

  const meta = centers.find((c) => c.id === center)
  const open = requests.filter((r) => r.centerId === center && r.status !== 'done' && r.status !== 'rejected' && r.status !== 'canceled').length
  const enabledServices = services.filter((s) => s.centerId === center && s.enabled).length

  return (
    <div>
      <PageHeader title={`${buildCenterTitle(center)} · 专员后台`} description="事项配置与申请处理（示例）" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>待处理申请</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-semibold text-[var(--color-text-primary)]">{open}</div>
            <div className="mt-2 text-sm text-[var(--color-text-tertiary)]">未结案</div>
            <div className="mt-3">
              <Link className="text-sm text-[var(--color-primary)] hover:underline" to={`/additional/${center}/admin/requests`}>
                进入处理台
              </Link>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>启用事项</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-semibold text-[var(--color-text-primary)]">{enabledServices}</div>
            <div className="mt-2 text-sm text-[var(--color-text-tertiary)]">当前可办理</div>
            <div className="mt-3">
              <Link className="text-sm text-[var(--color-primary)] hover:underline" to={`/additional/${center}/admin/services`}>
                进入配置
              </Link>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>联系信息</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2 text-sm text-[var(--color-text-secondary)]">
              <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                {meta?.contactName ?? '-'}
              </div>
              <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                {meta?.contactEmail ?? '-'}
              </div>
              <Link className="text-sm text-[var(--color-primary)] hover:underline" to={CENTER_PATH[center]}>
                返回中心
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>内容运营</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-sm text-[var(--color-text-tertiary)]">通知 / 制度 / FAQ</div>
            <div className="mt-3">
              <Link className="text-sm text-[var(--color-primary)] hover:underline" to={`/additional/${center}/admin/contents`}>
                进入内容管理
              </Link>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>组织与权限</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-sm text-[var(--color-text-tertiary)]">专员授权 / 角色范围</div>
            <div className="mt-3">
              <Link className="text-sm text-[var(--color-primary)] hover:underline" to={`/additional/${center}/admin/permissions`}>
                进入权限配置
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export function AdditionalAdminServicesPage() {
  const { center } = useParams()
  const { services, setServiceEnabled } = useAdditionalData()

  if (!isCenterId(center)) {
    return (
      <div>
        <PageHeader title="事项配置" description="参数错误" />
      </div>
    )
  }

  const rows = services.filter((s) => s.centerId === center).sort((a, b) => a.category.localeCompare(b.category))

  return (
    <div>
      <PageHeader title={`${buildCenterTitle(center)} · 事项配置`} description="启用/停用、快速发布（示例）" />
      <Card>
        <CardHeader>
          <CardTitle>事项列表</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="overflow-auto">
            <table className="w-full table-auto border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="text-xs text-[var(--color-text-tertiary)]">
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">事项</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">分类</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">审核</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">状态</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">操作</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => (
                  <tr key={s.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <div className="font-medium text-[var(--color-text-primary)]">{s.name}</div>
                      <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">{s.description}</div>
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{s.category}</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      {s.requireApproval ? <Badge tone="info">需审核</Badge> : <Badge tone="neutral">免审核</Badge>}
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      {s.enabled ? <Badge tone="success">启用</Badge> : <Badge tone="warning">停用</Badge>}
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant={s.enabled ? 'secondary' : 'primary'} onClick={() => setServiceEnabled(s.id, !s.enabled)}>
                          {s.enabled ? '停用' : '启用'}
                        </Button>
                        <Link className="text-sm text-[var(--color-primary)] hover:underline" to={`/additional/${center}/services/${encodeURIComponent(s.id)}`}>
                          查看
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

export function AdditionalAdminRequestsPage() {
  const { center } = useParams()
  const auth = useAuth()
  const { requests, updateRequestStatus, centers } = useAdditionalData()
  const [note, setNote] = useState('')
  const userName = auth.user?.name ?? '未登录'

  if (!isCenterId(center)) {
    return (
      <div>
        <PageHeader title="申请处理台" description="参数错误" />
      </div>
    )
  }

  const meta = centers.find((c) => c.id === center)
  const rows = requests
    .filter((r) => r.centerId === center)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  const action = (r: AdditionalRequest, status: AdditionalRequestStatus) => {
    updateRequestStatus({
      requestId: r.id,
      status,
      actor: userName,
      note: note.trim() || undefined,
      assignee: status === 'accepted' || status === 'in_progress' ? meta?.contactName ?? userName : null,
    })
    setNote('')
  }

  return (
    <div>
      <PageHeader title={`${buildCenterTitle(center)} · 申请处理台`} description="受理、处理、结案、驳回（示例）" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>申请列表</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {rows.map((r) => (
                <div
                  key={r.id}
                  className="flex flex-col gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">{r.serviceName}</div>
                      <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                        {r.id} · {r.applicant} · {r.updatedAt}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={requestStatusTone(r.status)}>{requestStatusText(r.status)}</Badge>
                      <Link className="text-sm text-[var(--color-primary)] hover:underline" to={`/additional/requests/${encodeURIComponent(r.id)}`}>
                        详情
                      </Link>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm" variant="secondary" disabled={r.status !== 'submitted'} onClick={() => action(r, 'accepted')}>
                      受理
                    </Button>
                    <Button size="sm" variant="secondary" disabled={r.status !== 'accepted'} onClick={() => action(r, 'in_progress')}>
                      处理中
                    </Button>
                    <Button size="sm" variant="primary" disabled={r.status === 'done' || r.status === 'rejected' || r.status === 'canceled'} onClick={() => action(r, 'done')}>
                      结案
                    </Button>
                    <Button size="sm" variant="danger" disabled={r.status === 'done' || r.status === 'rejected' || r.status === 'canceled'} onClick={() => action(r, 'rejected')}>
                      驳回
                    </Button>
                  </div>
                </div>
              ))}
              {!rows.length ? <div className="text-sm text-[var(--color-text-tertiary)]">暂无申请</div> : null}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>处理备注</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              <Input value={note} placeholder="可选：受理/驳回/结案说明" onChange={(e) => setNote(e.target.value)} />
              <div className="text-xs text-[var(--color-text-tertiary)]">
                备注会写入申请单时间线（受理/处理中/结案/驳回时）
              </div>
              <Link className="text-sm text-[var(--color-primary)] hover:underline" to={`/additional/${center}/admin`}>
                返回后台首页
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

function isContentType(value: string | undefined): value is AdditionalContentType {
  return value === 'notice' || value === 'policy' || value === 'faq'
}

function contentTypeText(type: AdditionalContentType) {
  if (type === 'notice') return '通知'
  if (type === 'policy') return '制度'
  return 'FAQ'
}

export function AdditionalContentListPage() {
  const { center, type } = useParams()
  const { contents } = useAdditionalData()

  if (!isCenterId(center) || !isContentType(type)) {
    return (
      <div>
        <PageHeader title="内容" description="参数错误" />
      </div>
    )
  }

  const rows = contents
    .filter((c) => c.centerId === center && c.type === type)
    .sort((a, b) => (b.pinned === true ? 1 : 0) - (a.pinned === true ? 1 : 0) || b.createdAt.localeCompare(a.createdAt))

  return (
    <div>
      <PageHeader title={`${buildCenterTitle(center)} · ${contentTypeText(type)}`} description="内容浏览（示例）" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{contentTypeText(type)}列表</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {rows.map((x) => (
                <div
                  key={x.id}
                  className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">{x.title}</div>
                      <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">{x.createdAt}</div>
                    </div>
                    {x.pinned ? <Badge tone="info">置顶</Badge> : <Badge tone="neutral">普通</Badge>}
                  </div>
                  <div className="mt-2 text-sm text-[var(--color-text-secondary)]">{x.body}</div>
                </div>
              ))}
              {!rows.length ? <div className="text-sm text-[var(--color-text-tertiary)]">暂无内容</div> : null}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>快捷入口</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2 text-sm">
              <Link className="text-[var(--color-primary)] hover:underline" to={`/additional/${center}`}>
                返回中心
              </Link>
              <Link className="text-[var(--color-primary)] hover:underline" to={`/additional/${center}/admin/contents`}>
                专员：内容管理
              </Link>
              <Link className="text-[var(--color-primary)] hover:underline" to={`/additional/${center}/services`}>
                查看事项
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export function AdditionalAdminContentsPage() {
  const { center } = useParams()
  const { contents, upsertContent, deleteContent, setContentPinned } = useAdditionalData()

  if (!isCenterId(center)) {
    return (
      <div>
        <PageHeader title="内容管理" description="参数错误" />
      </div>
    )
  }

  const rows = contents
    .filter((c) => c.centerId === center)
    .sort((a, b) => (b.pinned === true ? 1 : 0) - (a.pinned === true ? 1 : 0) || b.createdAt.localeCompare(a.createdAt))

  const [selectedId, setSelectedId] = useState<string | null>(rows[0]?.id ?? null)
  const selected = rows.find((x) => x.id === selectedId) ?? null

  const [draft, setDraft] = useState<AdditionalContent>(() => {
    if (selected) return selected
    return { id: `content-${center}-001`, centerId: center, type: 'notice', title: '', body: '', createdAt: '' }
  })

  const select = (id: string) => {
    const item = rows.find((x) => x.id === id)
    if (!item) return
    setSelectedId(id)
    setDraft(item)
  }

  const newItem = () => {
    const id = `content-${center}-${Math.floor(Math.random() * 900 + 100)}`
    setSelectedId(null)
    setDraft({ id, centerId: center, type: 'notice', title: '', body: '', createdAt: '' })
  }

  const save = () => {
    const createdAt = draft.createdAt || new Date().toISOString().slice(0, 16).replace('T', ' ')
    upsertContent({ ...draft, centerId: center, createdAt })
    setSelectedId(draft.id)
  }

  const remove = () => {
    if (!selectedId) return
    deleteContent(selectedId)
    setSelectedId(null)
    newItem()
  }

  const togglePinned = () => {
    if (!selected) return
    setContentPinned(selected.id, !selected.pinned)
  }

  return (
    <div>
      <PageHeader title={`${buildCenterTitle(center)} · 内容管理`} description="通知/制度/FAQ 发布与维护（示例）" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>内容列表</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {rows.map((x) => (
                <button
                  type="button"
                  key={x.id}
                  onClick={() => select(x.id)}
                  className="w-full rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3 text-left hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">{x.title}</div>
                      <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                        {contentTypeText(x.type)} · {x.createdAt}
                      </div>
                    </div>
                    {x.pinned ? <Badge tone="info">置顶</Badge> : <Badge tone="neutral">普通</Badge>}
                  </div>
                </button>
              ))}
              {!rows.length ? <div className="text-sm text-[var(--color-text-tertiary)]">暂无内容</div> : null}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>编辑</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              <div>
                <div className="mb-1 text-xs text-[var(--color-text-tertiary)]">类型</div>
                <Select value={draft.type} onChange={(e) => setDraft((p) => ({ ...p, type: e.target.value as AdditionalContentType }))}>
                  <option value="notice">通知</option>
                  <option value="policy">制度</option>
                  <option value="faq">FAQ</option>
                </Select>
              </div>
              <div>
                <div className="mb-1 text-xs text-[var(--color-text-tertiary)]">标题</div>
                <Input value={draft.title} onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))} />
              </div>
              <div>
                <div className="mb-1 text-xs text-[var(--color-text-tertiary)]">正文</div>
                <Textarea rows={8} value={draft.body} onChange={(e) => setDraft((p) => ({ ...p, body: e.target.value }))} />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="primary" className="flex-1" onClick={save} disabled={!draft.title.trim()}>
                  保存
                </Button>
                <Button variant="secondary" className="flex-1" onClick={newItem}>
                  新建
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" className="flex-1" onClick={togglePinned} disabled={!selected}>
                  {selected?.pinned ? '取消置顶' : '置顶'}
                </Button>
                <Button variant="danger" className="flex-1" onClick={remove} disabled={!selectedId}>
                  删除
                </Button>
              </div>
              <Link className="text-sm text-[var(--color-primary)] hover:underline" to={`/additional/${center}/admin`}>
                返回后台首页
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export function AdditionalAdminPermissionsPage() {
  const { center } = useParams()
  const { members, roles, roleBindings, addRoleBinding, removeRoleBinding } = useAdditionalData()

  if (!isCenterId(center)) {
    return (
      <div>
        <PageHeader title="权限配置" description="参数错误" />
      </div>
    )
  }

  const rows = roleBindings
    .filter((b) => b.scopeCenterId === center || b.scopeCenterId === 'all')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const [memberId, setMemberId] = useState(members[0]?.id ?? '')
  const [roleId, setRoleId] = useState<AdditionalRoleId>('additional:center_agent')

  const add = () => {
    if (!memberId) return
    addRoleBinding({ memberId, roleId, scopeCenterId: center })
  }

  return (
    <div>
      <PageHeader title={`${buildCenterTitle(center)} · 权限配置`} description="专员授权与角色范围（示例）" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>授权列表</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="overflow-auto">
              <table className="w-full table-auto border-separate border-spacing-0 text-left text-sm">
                <thead>
                  <tr className="text-xs text-[var(--color-text-tertiary)]">
                    <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">成员</th>
                    <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">角色</th>
                    <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">范围</th>
                    <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">时间</th>
                    <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((b) => {
                    const m = members.find((x) => x.id === b.memberId)
                    const r = roles.find((x) => x.id === b.roleId)
                    return (
                      <tr key={b.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                        <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                          <div className="font-medium text-[var(--color-text-primary)]">{m?.name ?? b.memberId}</div>
                          <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">{m?.department ?? '-'}</div>
                        </td>
                        <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{r?.name ?? b.roleId}</td>
                        <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                          {b.scopeCenterId === 'all' ? '全部中心' : buildCenterTitle(b.scopeCenterId)}
                        </td>
                        <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{b.createdAt}</td>
                        <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                          <Button size="sm" variant="danger" onClick={() => removeRoleBinding(b.id)}>
                            移除
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                  {!rows.length ? (
                    <tr>
                      <td className="px-3 py-6 text-sm text-[var(--color-text-tertiary)]" colSpan={5}>
                        暂无授权
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>新增授权</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              <div>
                <div className="mb-1 text-xs text-[var(--color-text-tertiary)]">成员</div>
                <Select value={memberId} onChange={(e) => setMemberId(e.target.value)}>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}（{m.department}）
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <div className="mb-1 text-xs text-[var(--color-text-tertiary)]">角色</div>
                <Select value={roleId} onChange={(e) => setRoleId(e.target.value as AdditionalRoleId)}>
                  {roles
                    .filter((r) => r.id !== 'additional:global_admin')
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                </Select>
              </div>
              <Button variant="primary" className="w-full" onClick={add} disabled={!memberId}>
                添加
              </Button>
              <Link className="text-sm text-[var(--color-primary)] hover:underline" to={`/additional/${center}/admin`}>
                返回后台首页
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export function AdditionalGlobalAdminHomePage() {
  const { centers, services, requests, contents, roleBindings } = useAdditionalData()
  const open = requests.filter((r) => r.status !== 'done' && r.status !== 'rejected' && r.status !== 'canceled').length

  return (
    <div>
      <PageHeader title="附加服务总后台" description="跨中心统一管理（示例）" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>中心</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-semibold text-[var(--color-text-primary)]">{centers.length}</div>
            <div className="mt-3">
              <Link className="text-sm text-[var(--color-primary)] hover:underline" to="/additional/admin/centers">
                管理中心
              </Link>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>事项</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-semibold text-[var(--color-text-primary)]">{services.length}</div>
            <div className="mt-3">
              <Link className="text-sm text-[var(--color-primary)] hover:underline" to="/additional/admin/services">
                管理事项
              </Link>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>待处理申请</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-semibold text-[var(--color-text-primary)]">{open}</div>
            <div className="mt-3">
              <Link className="text-sm text-[var(--color-primary)] hover:underline" to="/additional/admin/requests">
                进入处理台
              </Link>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>内容/权限</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-sm text-[var(--color-text-tertiary)]">
              内容 {contents.length} · 授权 {roleBindings.length}
            </div>
            <div className="mt-3 flex items-center gap-3">
              <Link className="text-sm text-[var(--color-primary)] hover:underline" to="/additional/admin/contents">
                内容
              </Link>
              <Link className="text-sm text-[var(--color-primary)] hover:underline" to="/additional/admin/permissions">
                权限
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export function AdditionalGlobalAdminCentersPage() {
  const { centers } = useAdditionalData()
  return (
    <div>
      <PageHeader title="总后台 · 中心" description="中心信息与快速入口（示例）" />
      <Card>
        <CardHeader>
          <CardTitle>中心列表</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="overflow-auto">
            <table className="w-full table-auto border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="text-xs text-[var(--color-text-tertiary)]">
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">中心</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">描述</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">联系人</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">操作</th>
                </tr>
              </thead>
              <tbody>
                {centers.map((c) => (
                  <tr key={c.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <div className="font-medium text-[var(--color-text-primary)]">{c.name}</div>
                      <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">{c.id}</div>
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{c.description}</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      {c.contactName} · {c.contactEmail}
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <div className="flex items-center gap-3">
                        <Link className="text-sm text-[var(--color-primary)] hover:underline" to={CENTER_PATH[c.id]}>
                          进入中心
                        </Link>
                        <Link className="text-sm text-[var(--color-primary)] hover:underline" to={`/additional/${c.id}/admin`}>
                          中心后台
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

export function AdditionalGlobalAdminServicesPage() {
  const { services, setServiceEnabled } = useAdditionalData()
  const rows = services.slice().sort((a, b) => a.centerId.localeCompare(b.centerId) || a.category.localeCompare(b.category))

  return (
    <div>
      <PageHeader title="总后台 · 事项" description="跨中心事项配置（示例）" />
      <Card>
        <CardHeader>
          <CardTitle>事项列表</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="overflow-auto">
            <table className="w-full table-auto border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="text-xs text-[var(--color-text-tertiary)]">
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">中心</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">事项</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">分类</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">审核</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">状态</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">操作</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => (
                  <tr key={s.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{buildCenterTitle(s.centerId)}</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <div className="font-medium text-[var(--color-text-primary)]">{s.name}</div>
                      <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">{s.id}</div>
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{s.category}</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      {s.requireApproval ? <Badge tone="info">需审核</Badge> : <Badge tone="neutral">免审核</Badge>}
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      {s.enabled ? <Badge tone="success">启用</Badge> : <Badge tone="warning">停用</Badge>}
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant={s.enabled ? 'secondary' : 'primary'} onClick={() => setServiceEnabled(s.id, !s.enabled)}>
                          {s.enabled ? '停用' : '启用'}
                        </Button>
                        <Link className="text-sm text-[var(--color-primary)] hover:underline" to={`/additional/${s.centerId}/services/${encodeURIComponent(s.id)}`}>
                          查看
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

export function AdditionalGlobalAdminRequestsPage() {
  const auth = useAuth()
  const { requests, updateRequestStatus, centers } = useAdditionalData()
  const [centerId, setCenterId] = useState<string>('all')
  const [note, setNote] = useState('')

  const rows = useMemo(() => {
    const base = requests.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    if (centerId === 'all') return base
    if (isCenterId(centerId)) return base.filter((r) => r.centerId === centerId)
    return base
  }, [centerId, requests])

  const action = (r: AdditionalRequest, status: AdditionalRequestStatus) => {
    updateRequestStatus({
      requestId: r.id,
      status,
      actor: auth.user?.name ?? '用户',
      note: note.trim() || undefined,
      assignee: status === 'accepted' || status === 'in_progress' ? r.currentAssignee ?? '总后台处理' : null,
    })
    setNote('')
  }

  return (
    <div>
      <PageHeader title="总后台 · 申请处理台" description="跨中心统一受理/结案（示例）" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>申请列表</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              <div>
                <div className="mb-1 text-xs text-[var(--color-text-tertiary)]">中心筛选</div>
                <Select value={centerId} onChange={(e) => setCenterId(e.target.value)}>
                  <option value="all">全部中心</option>
                  {centers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              {rows.map((r) => (
                <div
                  key={r.id}
                  className="flex flex-col gap-3 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                        {buildCenterTitle(r.centerId)} · {r.serviceName}
                      </div>
                      <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                        {r.id} · {r.applicant} · {r.updatedAt}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={requestStatusTone(r.status)}>{requestStatusText(r.status)}</Badge>
                      <Link className="text-sm text-[var(--color-primary)] hover:underline" to={`/additional/requests/${encodeURIComponent(r.id)}`}>
                        详情
                      </Link>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm" variant="secondary" disabled={r.status !== 'submitted'} onClick={() => action(r, 'accepted')}>
                      受理
                    </Button>
                    <Button size="sm" variant="secondary" disabled={r.status !== 'accepted'} onClick={() => action(r, 'in_progress')}>
                      处理中
                    </Button>
                    <Button size="sm" variant="primary" disabled={r.status === 'done' || r.status === 'rejected' || r.status === 'canceled'} onClick={() => action(r, 'done')}>
                      结案
                    </Button>
                    <Button size="sm" variant="danger" disabled={r.status === 'done' || r.status === 'rejected' || r.status === 'canceled'} onClick={() => action(r, 'rejected')}>
                      驳回
                    </Button>
                  </div>
                </div>
              ))}
              {!rows.length ? <div className="text-sm text-[var(--color-text-tertiary)]">暂无申请</div> : null}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>处理备注</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              <Input value={note} placeholder="可选：受理/驳回/结案说明" onChange={(e) => setNote(e.target.value)} />
              <div className="text-xs text-[var(--color-text-tertiary)]">备注会写入申请单时间线</div>
              <Link className="text-sm text-[var(--color-primary)] hover:underline" to="/additional/admin">
                返回总后台首页
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export function AdditionalGlobalAdminContentsPage() {
  const { contents, upsertContent, deleteContent, setContentPinned, centers } = useAdditionalData()
  const rows = contents.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const [selectedId, setSelectedId] = useState<string | null>(rows[0]?.id ?? null)
  const selected = rows.find((x) => x.id === selectedId) ?? null

  const [draft, setDraft] = useState<AdditionalContent>(() => {
    if (selected) return selected
    return { id: `content-global-001`, centerId: 'tdc', type: 'notice', title: '', body: '', createdAt: '' }
  })

  const select = (id: string) => {
    const item = rows.find((x) => x.id === id)
    if (!item) return
    setSelectedId(id)
    setDraft(item)
  }

  const newItem = () => {
    const id = `content-${Math.floor(Math.random() * 900 + 100)}`
    setSelectedId(null)
    setDraft({ id, centerId: 'tdc', type: 'notice', title: '', body: '', createdAt: '' })
  }

  const save = () => {
    const createdAt = draft.createdAt || new Date().toISOString().slice(0, 16).replace('T', ' ')
    upsertContent({ ...draft, createdAt })
    setSelectedId(draft.id)
  }

  const remove = () => {
    if (!selectedId) return
    deleteContent(selectedId)
    setSelectedId(null)
    newItem()
  }

  const togglePinned = () => {
    if (!selected) return
    setContentPinned(selected.id, !selected.pinned)
  }

  return (
    <div>
      <PageHeader title="总后台 · 内容" description="跨中心通知/制度/FAQ 管理（示例）" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>内容列表</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {rows.map((x) => (
                <button
                  type="button"
                  key={x.id}
                  onClick={() => select(x.id)}
                  className="w-full rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3 text-left hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">{x.title}</div>
                      <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                        {buildCenterTitle(x.centerId)} · {contentTypeText(x.type)} · {x.createdAt}
                      </div>
                    </div>
                    {x.pinned ? <Badge tone="info">置顶</Badge> : <Badge tone="neutral">普通</Badge>}
                  </div>
                </button>
              ))}
              {!rows.length ? <div className="text-sm text-[var(--color-text-tertiary)]">暂无内容</div> : null}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>编辑</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              <div>
                <div className="mb-1 text-xs text-[var(--color-text-tertiary)]">中心</div>
                <Select value={draft.centerId} onChange={(e) => setDraft((p) => ({ ...p, centerId: e.target.value as AdditionalCenterId }))}>
                  {centers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <div className="mb-1 text-xs text-[var(--color-text-tertiary)]">类型</div>
                <Select value={draft.type} onChange={(e) => setDraft((p) => ({ ...p, type: e.target.value as AdditionalContentType }))}>
                  <option value="notice">通知</option>
                  <option value="policy">制度</option>
                  <option value="faq">FAQ</option>
                </Select>
              </div>
              <div>
                <div className="mb-1 text-xs text-[var(--color-text-tertiary)]">标题</div>
                <Input value={draft.title} onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))} />
              </div>
              <div>
                <div className="mb-1 text-xs text-[var(--color-text-tertiary)]">正文</div>
                <Textarea rows={8} value={draft.body} onChange={(e) => setDraft((p) => ({ ...p, body: e.target.value }))} />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="primary" className="flex-1" onClick={save} disabled={!draft.title.trim()}>
                  保存
                </Button>
                <Button variant="secondary" className="flex-1" onClick={newItem}>
                  新建
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" className="flex-1" onClick={togglePinned} disabled={!selected}>
                  {selected?.pinned ? '取消置顶' : '置顶'}
                </Button>
                <Button variant="danger" className="flex-1" onClick={remove} disabled={!selectedId}>
                  删除
                </Button>
              </div>
              <Link className="text-sm text-[var(--color-primary)] hover:underline" to="/additional/admin">
                返回总后台首页
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export function AdditionalGlobalAdminPermissionsPage() {
  const { members, roles, roleBindings, addRoleBinding, removeRoleBinding } = useAdditionalData()

  const [memberId, setMemberId] = useState(members[0]?.id ?? '')
  const [roleId, setRoleId] = useState<AdditionalRoleId>('additional:center_agent')
  const [scope, setScope] = useState<string>('all')

  const add = () => {
    if (!memberId) return
    if (scope !== 'all' && !isCenterId(scope)) return
    addRoleBinding({ memberId, roleId, scopeCenterId: scope === 'all' ? 'all' : scope })
  }

  const rows = roleBindings.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <div>
      <PageHeader title="总后台 · 权限" description="跨中心授权管理（示例）" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>授权列表</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="overflow-auto">
              <table className="w-full table-auto border-separate border-spacing-0 text-left text-sm">
                <thead>
                  <tr className="text-xs text-[var(--color-text-tertiary)]">
                    <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">成员</th>
                    <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">角色</th>
                    <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">范围</th>
                    <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">时间</th>
                    <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((b) => {
                    const m = members.find((x) => x.id === b.memberId)
                    const r = roles.find((x) => x.id === b.roleId)
                    return (
                      <tr key={b.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                        <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                          <div className="font-medium text-[var(--color-text-primary)]">{m?.name ?? b.memberId}</div>
                          <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">{m?.department ?? '-'}</div>
                        </td>
                        <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{r?.name ?? b.roleId}</td>
                        <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                          {b.scopeCenterId === 'all' ? '全部中心' : buildCenterTitle(b.scopeCenterId)}
                        </td>
                        <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{b.createdAt}</td>
                        <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                          <Button size="sm" variant="danger" onClick={() => removeRoleBinding(b.id)}>
                            移除
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>新增授权</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              <div>
                <div className="mb-1 text-xs text-[var(--color-text-tertiary)]">成员</div>
                <Select value={memberId} onChange={(e) => setMemberId(e.target.value)}>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}（{m.department}）
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <div className="mb-1 text-xs text-[var(--color-text-tertiary)]">角色</div>
                <Select value={roleId} onChange={(e) => setRoleId(e.target.value as AdditionalRoleId)}>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <div className="mb-1 text-xs text-[var(--color-text-tertiary)]">范围</div>
                <Select value={scope} onChange={(e) => setScope(e.target.value)}>
                  <option value="all">全部中心</option>
                  <option value="tdc">人才发展中心</option>
                  <option value="party">党群</option>
                  <option value="union">工会</option>
                  <option value="women">妇联</option>
                </Select>
              </div>
              <Button variant="primary" className="w-full" onClick={add} disabled={!memberId}>
                添加
              </Button>
              <Link className="text-sm text-[var(--color-primary)] hover:underline" to="/additional/admin">
                返回总后台首页
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
