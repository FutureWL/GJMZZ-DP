import { Link } from 'react-router-dom'
import { Badge } from '../../ui/Badge'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { PageHeader } from '../../ui/PageHeader'

const linkBase =
  'inline-flex items-center justify-center gap-2 rounded-[6px] border px-3 py-2 text-sm font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]'

const linkSecondary =
  `${linkBase} border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] hover:bg-black/5 dark:hover:bg-white/5`

export function PrototypeHubPage() {
  return (
    <div>
      <PageHeader
        title="多端 UI 原型"
        description="用于快速评审信息架构与关键交互（示例数据/静态原型）"
        right={<Badge tone="domain-additional">原型</Badge>}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>手机端：移动门户</CardTitle>
            <Badge tone="info">Mobile</Badge>
          </CardHeader>
          <CardBody>
            <div className="text-sm text-[var(--color-text-secondary)]">
              待办/通知/常用应用入口，强调“每天打开”的触达体验。
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Link to="/additional/prototypes/mobile-portal" className={linkSecondary}>
                查看原型
              </Link>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>手机端：CRM 外勤闭环</CardTitle>
            <Badge tone="info">Mobile</Badge>
          </CardHeader>
          <CardBody>
            <div className="text-sm text-[var(--color-text-secondary)]">
              拜访计划/签到/跟进记录/附件，面向销售外勤高频录入。
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Link to="/additional/prototypes/mobile-crm" className={linkSecondary}>
                查看原型
              </Link>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>电视/墙面：大屏看板</CardTitle>
            <Badge tone="warning">TV</Badge>
          </CardHeader>
          <CardBody>
            <div className="text-sm text-[var(--color-text-secondary)]">
              只做展示与轮播：经营/产销/异常预警，强调可读性与稳定性。
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Link to="/additional/prototypes/tv-wallboard" className={linkSecondary}>
                查看原型
              </Link>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>领导：数据驾驶舱</CardTitle>
            <Badge tone="success">Cockpit</Badge>
          </CardHeader>
          <CardBody>
            <div className="text-sm text-[var(--color-text-secondary)]">
              核心 KPI 一屏到底 + 钻取链路 + 预警提示，面向会议决策。
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Link to="/additional/prototypes/cockpit" className={linkSecondary}>
                查看原型
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

