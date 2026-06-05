import { Badge } from '../ui/Badge'
import { BottomNav } from '../ui/BottomNav'
import { Card, CardBody } from '../ui/Card'
import { PageHeader } from '../ui/PageHeader'

export function MePage() {
  return (
    <div className="p-4">
      <PageHeader title="我的" description="占位页" right={<Badge tone="neutral">Me</Badge>} />
      <div className="mx-auto max-w-[520px]">
        <Card className="shadow-none">
          <CardBody>
            <div className="text-sm text-[var(--color-text-secondary)]">后续可放：个人信息、组织切换、设置、退出登录。</div>
          </CardBody>
        </Card>
      </div>
      <BottomNav />
    </div>
  )
}

