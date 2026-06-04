import { Card, CardBody, CardHeader, CardTitle } from '../ui/Card'
import { PageHeader } from '../ui/PageHeader'

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div>
      <PageHeader title={title} description="此页面为界面占位，用于确认导航、布局与视觉体系。" />
      <Card>
        <CardHeader>
          <CardTitle>占位内容</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="text-sm text-[var(--color-text-secondary)]">
            后续可在不改变布局与设计 Token 的情况下替换为真实业务字段与数据。
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

