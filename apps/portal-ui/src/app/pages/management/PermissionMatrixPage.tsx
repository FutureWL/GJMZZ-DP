import { Badge } from '../../ui/Badge'
import { Card, CardBody, CardHeader, CardTitle } from '../../ui/Card'
import { PageHeader } from '../../ui/PageHeader'

const roles = [
  { role: '员工', scope: '本人/本人项目', actions: ['发起', '撤回（未处理前）', '补充材料'] },
  { role: '项目负责人', scope: '本项目', actions: ['审批', '加签', '退回'] },
  { role: '成本中心负责人', scope: '本成本中心', actions: ['审批', '退回', '导出（受控）'] },
  { role: '部门负责人', scope: '本部门', actions: ['审批', '加签', '转交'] },
  { role: '财务审核', scope: '全公司（字段脱敏）', actions: ['审核', '退回', '导出（审计）'] },
  { role: '稽核/内控', scope: '全公司（审计）', actions: ['抽查', '导出', '追溯'] },
]

export function PermissionMatrixPage() {
  return (
    <div>
      <PageHeader
        title="权限矩阵（示例）"
        description="菜单权限 + 数据范围 + 字段权限 + 动作权限（UI示例，用于对齐口径）"
        right={<Badge tone="domain-management">管理</Badge>}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>角色 × 数据范围</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="overflow-auto">
              <table className="w-full table-auto border-separate border-spacing-0 text-left text-sm">
                <thead>
                  <tr className="text-xs text-[var(--color-text-tertiary)]">
                    <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">角色</th>
                    <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">数据范围</th>
                    <th className="border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold">典型动作</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((r) => (
                    <tr key={r.role} className="hover:bg-black/5 dark:hover:bg-white/5">
                      <td className="border-b border-[var(--color-border-subtle)] px-3 py-2 text-[var(--color-text-primary)]">
                        {r.role}
                      </td>
                      <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">{r.scope}</td>
                      <td className="border-b border-[var(--color-border-subtle)] px-3 py-2">
                        <div className="flex flex-wrap gap-2">
                          {r.actions.map((a) => (
                            <Badge key={a} tone="neutral">
                              {a}
                            </Badge>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>字段权限示例</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-3 text-sm text-[var(--color-text-secondary)]">
              <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                <div className="text-sm font-medium text-[var(--color-text-primary)]">金额</div>
                <div className="mt-2 text-xs text-[var(--color-text-tertiary)]">员工仅见本人单据；跨部门查看需脱敏或禁止</div>
              </div>
              <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                <div className="text-sm font-medium text-[var(--color-text-primary)]">银行卡/个人信息</div>
                <div className="mt-2 text-xs text-[var(--color-text-tertiary)]">仅财务/出纳可见；其他角色显示脱敏</div>
              </div>
              <div className="rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                <div className="text-sm font-medium text-[var(--color-text-primary)]">导出/打印</div>
                <div className="mt-2 text-xs text-[var(--color-text-tertiary)]">必须记录审计日志，支持按范围限制</div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

