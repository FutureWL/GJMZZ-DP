import clsx from 'clsx'
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'

export type DataTableColumn<T> = {
  header: ReactNode
  accessorKey?: keyof T | string
  cell?: (item: T) => ReactNode
  widthClassName?: string
  headerClassName?: string
  cellClassName?: string
  sticky?: 'left' | 'right'
}

export type DataTablePagination = {
  total: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
}

function formatRange(page: number, pageSize: number, total: number) {
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)
  return { start, end }
}

export function DataTable<T>({
  columns,
  data,
  selectable = false,
  getRowId,
  onRowClick,
  pagination,
  emptyText = '暂无数据',
}: {
  columns: DataTableColumn<T>[]
  data: T[]
  selectable?: boolean
  getRowId?: (item: T) => string
  onRowClick?: (item: T) => void
  pagination?: DataTablePagination
  emptyText?: string
}) {
  const resolveRowId = useMemo(() => {
    return (
      getRowId ??
      ((item: T) => {
        const id = (item as any)?.id
        return typeof id === 'string' ? id : JSON.stringify(item)
      })
    )
  }, [getRowId])

  const rowIds = useMemo(() => data.map(resolveRowId), [data, resolveRowId])
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({})

  const allChecked = selectable && rowIds.length > 0 && rowIds.every((id) => selectedIds[id])
  const someChecked = selectable && rowIds.some((id) => selectedIds[id]) && !allChecked

  const selectedCount = useMemo(() => Object.values(selectedIds).filter(Boolean).length, [selectedIds])

  const totalPages = pagination ? Math.max(1, Math.ceil(pagination.total / pagination.pageSize)) : 1
  const range = pagination ? formatRange(pagination.page, pagination.pageSize, pagination.total) : null

  return (
    <div>
      <div className="overflow-auto">
        <table className="w-full table-auto border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr className="text-xs text-[var(--color-text-tertiary)]">
              {selectable ? (
                <th className="sticky left-0 z-10 w-10 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-page)] px-3 py-2 font-semibold">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    ref={(el) => {
                      if (el) el.indeterminate = someChecked
                    }}
                    onChange={(e) => {
                      const checked = e.target.checked
                      setSelectedIds((prev) => {
                        const next = { ...prev }
                        for (const id of rowIds) {
                          next[id] = checked
                        }
                        return next
                      })
                    }}
                    className="h-4 w-4 rounded border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] text-[var(--color-primary)]"
                  />
                </th>
              ) : null}

              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={clsx(
                    'border-b border-[var(--color-border-subtle)] px-3 py-2 font-semibold',
                    col.widthClassName,
                    col.sticky === 'left' && 'sticky left-0 z-10 bg-[var(--color-bg-page)]',
                    col.sticky === 'right' && 'sticky right-0 z-10 bg-[var(--color-bg-page)]',
                    col.headerClassName,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.map((item) => {
              const id = resolveRowId(item)
              return (
                <tr
                  key={id}
                  className={clsx('hover:bg-black/5 dark:hover:bg-white/5', onRowClick && 'cursor-pointer')}
                  onClick={() => onRowClick?.(item)}
                >
                  {selectable ? (
                    <td className="sticky left-0 z-10 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-page)] px-3 py-2">
                      <input
                        type="checkbox"
                        checked={!!selectedIds[id]}
                        onChange={(e) => {
                          const checked = e.target.checked
                          setSelectedIds((prev) => ({ ...prev, [id]: checked }))
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 rounded border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] text-[var(--color-primary)]"
                      />
                    </td>
                  ) : null}

                  {columns.map((col, idx) => {
                    const content = col.cell
                      ? col.cell(item)
                      : col.accessorKey
                        ? ((item as any)[col.accessorKey as any] as ReactNode)
                        : null
                    return (
                      <td
                        key={idx}
                        className={clsx(
                          'border-b border-[var(--color-border-subtle)] px-3 py-2',
                          col.widthClassName,
                          col.sticky === 'left' && 'sticky left-0 z-10 bg-[var(--color-bg-page)]',
                          col.sticky === 'right' && 'sticky right-0 z-10 bg-[var(--color-bg-page)]',
                          col.cellClassName,
                        )}
                        onClick={(e) => {
                          if (col.sticky === 'right') e.stopPropagation()
                        }}
                      >
                        {content}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {data.length === 0 ? <div className="mt-3 text-sm text-[var(--color-text-tertiary)]">{emptyText}</div> : null}

      {pagination ? (
        <div className="mt-3 flex flex-col gap-2 border-t border-[var(--color-border-subtle)] pt-3 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-[var(--color-text-tertiary)]">
            {selectable ? `已选 ${selectedCount} 项 · ` : null}
            显示 {range?.start}-{range?.end} / 共 {pagination.total} 条
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              className="h-8 rounded-[6px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-3 text-xs text-[var(--color-text-primary)] hover:bg-black/5 dark:hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={pagination.page <= 1}
              onClick={() => pagination.onPageChange(Math.max(1, pagination.page - 1))}
            >
              上一页
            </button>
            <div className="text-xs text-[var(--color-text-tertiary)]">
              {pagination.page} / {totalPages}
            </div>
            <button
              type="button"
              className="h-8 rounded-[6px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-3 text-xs text-[var(--color-text-primary)] hover:bg-black/5 dark:hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={pagination.page >= totalPages}
              onClick={() => pagination.onPageChange(Math.min(totalPages, pagination.page + 1))}
            >
              下一页
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

