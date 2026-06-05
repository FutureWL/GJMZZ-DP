import { Link } from 'react-router-dom'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { Input } from '../../ui/Input'
import { PageHeader } from '../../ui/PageHeader'
import { supportKnowledgeArticles } from './mockSupport'

export function SupportKnowledgeBasePage() {
  return (
    <div>
      <PageHeader title="知识库 / SOP" description="面向支持部门的内部知识与标准作业（示例数据）" />
      <Card>
        <CardHeader>
          <CardTitle>搜索</CardTitle>
        </CardHeader>
        <CardBody>
          <Input placeholder="搜索关键词（占位，不做实际过滤）" />
        </CardBody>
      </Card>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>推荐文章</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {supportKnowledgeArticles.map((a) => (
                <div
                  key={a.id}
                  className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-medium text-[var(--color-text-primary)]">{a.title}</div>
                    <div className="text-xs text-[var(--color-text-tertiary)]">{a.updatedAt}</div>
                  </div>
                  <div className="mt-2 text-sm text-[var(--color-text-secondary)]">{a.summary}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
                    {a.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-[999px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-2 py-1"
                      >
                        {t}
                      </span>
                    ))}
                    <span className="ml-auto">
                      <Link className="text-[var(--color-primary)] hover:underline" to="/support/kb">
                        打开（占位）
                      </Link>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

