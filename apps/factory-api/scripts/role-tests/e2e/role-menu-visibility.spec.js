// @ts-check
// 角色 → 菜单可见性 e2e
// 用 5 个不同 position 的用户登录,断言侧边栏可见叶子菜单

const { test, expect } = require('@playwright/test')
const fs = require('node:fs')

const BASE_URL = 'http://127.0.0.1:33700'

const SHOT_DIR = '/root/DataDisk/workspace/GJMZZ-DP/requirements/08_role-journeys/e2e-screenshots/menu-visibility'
if (!fs.existsSync(SHOT_DIR)) fs.mkdirSync(SHOT_DIR, { recursive: true })

/** 走真实的 Keycloak 授权码流程(不绕过 SSO) */
async function loginViaBrowser(page, username, password) {
  await page.goto(`${BASE_URL}/portal/`)
  await page.waitForURL(/portal\/login/, { timeout: 10000 })
  await page.getByRole('button', { name: /SSO 登录/ }).click()
  await page.waitForURL(/protocol\/openid-connect\/auth/, { timeout: 15000 })
  await page.fill('#username', username)
  await page.fill('#password', password)
  await page.getByRole('button', { name: /Sign In|登录/ }).click()
  await page.waitForURL(/127\.0\.0\.1:33700/, { timeout: 25000 })
  await page.waitForLoadState('networkidle', { timeout: 15000 })
}

/** 收集侧边栏所有 a[href] 中的 /portal/... 路径 */
async function getSidebarLinks(page) {
  return await page.evaluate(() => {
    const out = new Set()
    for (const a of document.querySelectorAll('a[href]')) {
      const href = a.getAttribute('href') || ''
      const m = href.match(/^\/portal(\/[^?#]*)/)
      if (m && m[1] && m[1] !== '/') out.add(m[1])
    }
    return Array.from(out).sort()
  })
}

const ROLES = [
  {
    user: 'inspector',
    pos: 'quality',
    expectPaths: ['/quality/inspections', '/quality/traceability', '/management/approval', '/management/notifications', '/workbench'],
    forbidPaths: ['/equipment/workorders', '/sales/order', '/supply/procurement/orders', '/production/execution/dispatch'],
  },
  {
    user: 'tech',
    pos: 'plant_manager',
    expectPaths: ['/equipment/workorders', '/equipment/monitoring', '/equipment/dashboard', '/management/erp/expenses', '/management/approval', '/workbench'],
    forbidPaths: ['/quality/inspections', '/quality/traceability', '/sales/order', '/production/execution/scheduling'],
  },
  {
    user: 'mgr-production',
    pos: 'manager',
    expectPaths: ['/production/execution/scheduling', '/production/execution/workorders', '/sales/order', '/quality/inspections', '/equipment/workorders', '/management/security/permissions'],
    forbidPaths: [],
  },
  {
    user: 'mgr-procurement',
    pos: 'approver',
    expectPaths: ['/supply/procurement/orders', '/quality/inspections', '/equipment/workorders', '/production/execution/scheduling', '/sales/order'],
    forbidPaths: ['/management/security/permissions'],
  },
  {
    user: 'ceo',
    pos: 'approver',
    expectPaths: ['/supply/procurement/orders', '/quality/inspections', '/equipment/workorders', '/production/execution/scheduling', '/sales/order', '/management/audit/log'],
    forbidPaths: ['/management/security/permissions'],
  },
]

for (const r of ROLES) {
  test(`${r.user} (${r.pos}) 侧边栏只看到对应菜单`, async ({ page }) => {
    await loginViaBrowser(page, r.user, 'Pass1234!')
    await page.waitForSelector('aside, nav', { timeout: 8000 }).catch(() => {})
    const links = await getSidebarLinks(page)
    await page.screenshot({ path: `${SHOT_DIR}/${r.user}-sidebar.png`, fullPage: true })

    for (const p of r.expectPaths) {
      expect(links, `${r.user} 应见 ${p},实际见 ${JSON.stringify(links)}`).toContain(p)
    }
    for (const p of r.forbidPaths) {
      expect(links, `${r.user} 不应见 ${p},实际见 ${JSON.stringify(links)}`).not.toContain(p)
    }
  })
}