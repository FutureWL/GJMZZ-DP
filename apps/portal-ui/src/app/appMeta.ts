export const APP_TITLE = '高精密制造数字化平台'

export function formatDocumentTitle(pageTitle?: string | null) {
  const normalized = pageTitle?.trim()
  if (!normalized || normalized === APP_TITLE) return APP_TITLE
  return `${APP_TITLE} - ${normalized}`
}
