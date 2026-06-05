import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCrmData } from '../../../state/crm/CrmDataContext'
import { Badge, type Tone } from '../../../ui/Badge'
import { Card, CardBody, CardHeader, CardTitle } from '../../../ui/Card'
import { Input } from '../../../ui/Input'
import { PageHeader } from '../../../ui/PageHeader'
import { Select } from '../../../ui/Select'

function levelTone(level: string): Tone {
  if (level === 'A') return 'success'
  if (level === 'B') return 'info'
  return 'neutral'
}

function statusTone(status: string): Tone {
  if (status === 'active') return 'success'
  return 'neutral'
}

export function CustomerListPage() {
  const { customers } = useCrmData()
  const [q, setQ] = useState('')
  const [industry, setIndustry] = useState('')
  const [level, setLevel] = useState('')
  const [status, setStatus] = useState('')
  const [sort, setSort] = useState('nextFollowUpAt-asc')

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
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:justify-end">
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
          </div>
          <div className="overflow-auto">
            <table className="w-full table-auto border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="text-xs text-[var(--color-text-tertiary)]">
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">客户</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">行业</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">等级</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">负责人</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">最近联系</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">下次跟进</th>
                  <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">状态</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <Link
                        to={`/business/crm/customers/${encodeURIComponent(c.id)}`}
                        className="font-medium text-[var(--color-primary)] hover:underline"
                      >
                        {c.name}
                      </Link>
                      <div className="mt-1 text-xs text-[var(--color-text-tertiary)]">{c.id}</div>
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{c.industry}</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <Badge tone={levelTone(c.level)}>{c.level}</Badge>
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{c.owner}</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{c.lastContactAt}</td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <div className="text-[var(--color-text-primary)]">{c.nextFollowUpAt ?? '-'}</div>
                      {c.nextFollowUpNote ? (
                        <div className="mt-1 line-clamp-2 text-xs text-[var(--color-text-tertiary)]">
                          {c.nextFollowUpNote}
                        </div>
                      ) : null}
                    </td>
                    <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                      <Badge tone={statusTone(c.status)}>{c.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length === 0 ? <div className="mt-3 text-sm text-[var(--color-text-tertiary)]">暂无数据</div> : null}
        </CardBody>
      </Card>
    </div>
  )
}
