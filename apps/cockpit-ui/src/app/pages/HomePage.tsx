import { Link } from 'react-router-dom'
import { ScaleFit } from '../layout/ScaleFit'
import { Surface } from '../ui/Surface'
import { Factory, TrendingUp } from 'lucide-react'

export function HomePage() {
  return (
    <ScaleFit designWidth={1920} designHeight={1080}>
      <div className="h-full w-full p-10">
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="text-5xl font-semibold tracking-tight text-[var(--color-text-primary)]">领导数据驾驶舱</div>
            <div className="mt-3 text-lg text-[var(--color-text-secondary)]">生产与经营关键指标 · 全屏展示</div>
          </div>
          <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-6 py-4 text-sm text-[var(--color-text-tertiary)]">
            建议分辨率：1920×1080 / 3840×2160
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-8">
          <Surface className="group relative overflow-hidden p-10">
            <div className="pointer-events-none absolute inset-0 opacity-60 bg-[radial-gradient(600px_300px_at_0%_0%,rgba(52,211,153,0.20),transparent_60%)]" />
            <div className="relative flex items-start justify-between">
              <div>
                <div className="text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">生产概览</div>
                <div className="mt-2 text-[var(--color-text-secondary)]">OTD / OEE / 异常与告警 / 在制工单</div>
              </div>
              <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface-strong)] p-3 text-[var(--color-domain-production)]">
                <Factory className="h-7 w-7" />
              </div>
            </div>
            <div className="relative mt-8">
              <Link
                to="/screen/production"
                className="inline-flex items-center rounded-xl bg-[var(--color-primary)] px-6 py-3 text-base font-semibold text-white hover:bg-[var(--color-primary-hover)]"
              >
                进入大屏
              </Link>
            </div>
          </Surface>

          <Surface className="group relative overflow-hidden p-10">
            <div className="pointer-events-none absolute inset-0 opacity-60 bg-[radial-gradient(600px_300px_at_0%_0%,rgba(129,140,248,0.18),transparent_60%)]" />
            <div className="relative flex items-start justify-between">
              <div>
                <div className="text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">经营概览</div>
                <div className="mt-2 text-[var(--color-text-secondary)]">审批待办 / 费用 / 合同 / 采购流程</div>
              </div>
              <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface-strong)] p-3 text-[var(--color-domain-management)]">
                <TrendingUp className="h-7 w-7" />
              </div>
            </div>
            <div className="relative mt-8">
              <Link
                to="/screen/management"
                className="inline-flex items-center rounded-xl bg-[var(--color-primary)] px-6 py-3 text-base font-semibold text-white hover:bg-[var(--color-primary-hover)]"
              >
                进入大屏
              </Link>
            </div>
          </Surface>
        </div>
      </div>
    </ScaleFit>
  )
}
