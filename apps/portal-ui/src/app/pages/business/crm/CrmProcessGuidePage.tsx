import { Link } from 'react-router-dom'
import { Card, CardBody, CardHeader, CardTitle } from '../../../ui/Card'
import { PageHeader } from '../../../ui/PageHeader'

const linkBaseClassName =
  'inline-flex items-center justify-center gap-2 rounded-[6px] border px-3 py-2 text-sm font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]'

function linkClassName(variant: 'primary' | 'secondary' = 'secondary') {
  if (variant === 'primary') {
    return `${linkBaseClassName} border-transparent bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]`
  }
  return `${linkBaseClassName} border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] hover:bg-black/5 dark:hover:bg-white/5`
}

export function CrmProcessGuidePage() {
  return (
    <div>
      <PageHeader title="业务流程指导" description="CRM：常用业务流程与页面入口（用于快速上手）" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>客户建档</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-sm text-[var(--color-text-tertiary)]">
              建立客户主数据与关键联系人，为后续机会与报价打基础。
            </div>
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-[var(--color-text-primary)]">
              <li>进入客户列表，确认是否已有客户记录</li>
              <li>补充客户信息，并建立联系人档案</li>
              <li>在客户详情中持续维护关键字段与状态</li>
              <li>通过跟进记录沉淀沟通纪要与下一步计划</li>
            </ol>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/business/crm/customers" className={linkClassName('primary')}>
                客户列表
              </Link>
              <Link to="/business/crm/contacts" className={linkClassName('secondary')}>
                联系人
              </Link>
              <Link to="/business/crm/activities" className={linkClassName('secondary')}>
                跟进记录
              </Link>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>机会推进</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-sm text-[var(--color-text-tertiary)]">围绕客户需求建立机会，并按阶段推进成交。</div>
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-[var(--color-text-primary)]">
              <li>创建/维护机会，明确金额、预计成交日期与负责人</li>
              <li>根据进展更新机会阶段，保持销售漏斗准确</li>
              <li>需要时关联报价单，形成对外报价版本</li>
              <li>赢单/丢单后复盘原因，沉淀可复用打法</li>
            </ol>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/business/crm/opportunities" className={linkClassName('primary')}>
                机会列表
              </Link>
              <Link to="/business/crm/quotes" className={linkClassName('secondary')}>
                报价
              </Link>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>报价管理</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-sm text-[var(--color-text-tertiary)]">
              对外报价的版本、状态与有效期管理，支撑谈判与下单。
            </div>
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-[var(--color-text-primary)]">
              <li>建立报价并维护条款、金额与有效期</li>
              <li>将报价与对应机会关联，便于回溯转化路径</li>
              <li>根据客户反馈更新状态与版本记录</li>
              <li>在详情页快速定位当前有效版本与关键字段</li>
            </ol>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/business/crm/quotes" className={linkClassName('primary')}>
                报价列表
              </Link>
              <Link to="/business/crm/opportunities" className={linkClassName('secondary')}>
                机会
              </Link>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>跟进与回顾</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-sm text-[var(--color-text-tertiary)]">记录沟通与计划，形成连续的客户经营轨迹。</div>
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-[var(--color-text-primary)]">
              <li>记录每次沟通的主题、类型、负责人和计划时间</li>
              <li>必要时关联客户与联系人，保证信息可追溯</li>
              <li>完成后标记状态，并沉淀下一步行动项</li>
              <li>定期回顾历史记录，持续优化沟通节奏与策略</li>
            </ol>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/business/crm/activities" className={linkClassName('primary')}>
                跟进记录
              </Link>
              <Link to="/business/crm/customers" className={linkClassName('secondary')}>
                客户
              </Link>
              <Link to="/business/crm/contacts" className={linkClassName('secondary')}>
                联系人
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

