export function Footer() {
  return (
    <footer className="mt-8 flex flex-col gap-1 border-t border-[var(--color-border-subtle)] py-4 text-xs text-[var(--color-text-tertiary)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-[var(--color-text-secondary)]">高精密制造数字化平台</div>
        <div>Version 0.1.0</div>
      </div>
      <div>说明：本系统为界面原型演示，页面数据为 mock，不代表真实生产数据与业务口径。</div>
    </footer>
  )
}

