import clsx from 'clsx'

export function Avatar({
  text,
  size = 28,
  className,
}: {
  text: string
  size?: number
  className?: string
}) {
  return (
    <div
      className={clsx(
        'inline-flex items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-primary)] text-xs font-semibold text-white',
        className,
      )}
      style={{ width: size, height: size }}
    >
      {text}
    </div>
  )
}

