// @ts-check
// 中层 5 角色 e2e:登录 + 侧边栏 + 审批中心 + 提交业务

const { test, expect } = require('@playwright/test')
const { execSync } = require('node:child_process')
const path = require('node:path')
const fs = require('node:fs')

const KC_URL = 'http://127.0.0.1:18080'
const REALM = 'factory-platform'
const CLIENT_ID = 'dev-cli'
const SHOT_DIR = '/root/DataDisk/workspace/GJMZZ-DP/requirements/08_role-journeys/e2e-screenshots/middleground'
if (!fs.existsSync(SHOT_DIR)) fs.mkdirSync(SHOT_DIR, { recursive: true })

function getKeycloakToken(username, password) {
  const body = new URLSearchParams({
    grant_type: 'password',
    client_id: CLIENT_ID,
    username,
    password,
  })
  const res = execSync(
    `curl -sS -X POST "${KC_URL}/realms/${REALM}/protocol/openid-connect/token" -H "Content-Type: application/x-www-form-urlencoded" -d ${shellEscape(
      body.toString(),
    )}`,
    { encoding: 'utf8' },
  )
  const data = JSON.parse(res)
  return data.access_token
}

function shellEscape(s) {
  return `'${s.replace(/'/g, `'\\''`)}'`
}

async function loginViaBrowser(page, username, password) {
  await page.goto('http://127.0.0.1:33700/portal/')
  await page.waitForURL(/portal\/login/, { timeout: 10000 })
  await page.getByRole('button', { name: /SSO 登录/ }).click()
  await page.waitForURL(/protocol\/openid-connect\/auth/, { timeout: 15000 })
  await page.fill('#username', username)
  await page.fill('#password', password)
  await page.getByRole('button', { name: /Sign In|登录/ }).click()
  await page.waitForURL(/127\.0\.0\.1:33700/, { timeout: 25000 })
  await page.waitForLoadState('networkidle', { timeout: 15000 })
}

const ROLES = [
  { id: 'mgr-production', name: '钱经理(生产经理)', position: 'manager' },
  { id: 'mgr-quality', name: '孙经理(质量经理)', position: 'quality_manager' },
  { id: 'mgr-procurement', name: '周经理(采购经理)', position: 'approver' },
  { id: 'mgr-equipment', name: '吴经理(设备经理)', position: 'plant_manager' },
  { id: 'mgr-it', name: '郑经理(IT经理)', position: 'approver' },
]

for (const role of ROLES) {
  test(`中层 ${role.id}(${role.name}) — 登录 + 侧边栏 + 审批中心`, async ({ page }) => {
    await loginViaBrowser(page, role.id, 'Pass1234!')
    await page.screenshot({ path: path.join(SHOT_DIR, `${role.id}-01-after-login.png`), fullPage: true })

    await page.waitForSelector('aside, [data-testid="sidebar"], nav', { timeout: 8000 }).catch(() => {})
    const expectedMenus = ['工作台', '营销与客户', '计划与生产', '质量与设备', '采购与供应链', '综合管理']
    for (const m of expectedMenus) {
      const locator = page.locator('aside, nav').getByText(m, { exact: false }).first()
      const count = await locator.count()
      expect(count, `${role.id} sidebar 应包含 "${m}"`).toBeGreaterThan(0)
    }

    await page.goto('http://127.0.0.1:33700/portal/management/approval')
    await page.waitForLoadState('networkidle', { timeout: 10000 })
    await page.waitForTimeout(500)
    await page.screenshot({ path: path.join(SHOT_DIR, `${role.id}-02-approval-center.png`), fullPage: true })

    const realSection = page.locator('body').getByText('真实流程', { exact: false }).first()
    await expect(realSection, '审批中心应有"真实流程"区').toBeVisible({ timeout: 5000 })
  })

  test(`中层 ${role.id} — 提交业务单据(费用)→ 真实流程启动`, async ({ page, request }) => {
    await loginViaBrowser(page, role.id, 'Pass1234!')

    const token = getKeycloakToken(role.id, 'Pass1234!')
    const claimId = `${role.id.toUpperCase()}-E2E-${Date.now()}`
    const startResp = await request.post('http://127.0.0.1:33700/api/workflow/instances', {
      headers: { Authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      data: {
        businessKey: claimId,
        variables: { businessType: 'expense_claim', amountTotal: 1234.56, _e2e: true, _role: role.id },
      },
    })
    expect(startResp.status(), '启动流程应成功').toBe(201)
    const proc = await startResp.json()
    expect(proc.id).toBeTruthy()
    expect(proc.businessKey).toBe(claimId)

    await page.goto('http://127.0.0.1:33700/portal/management/approval')
    await page.waitForLoadState('networkidle', { timeout: 10000 })
    await page.waitForTimeout(500)
    const refreshBtn = page.getByRole('button', { name: /刷新真实待办/ })
    if (await refreshBtn.count()) {
      await refreshBtn.first().click()
      await page.waitForTimeout(800)
    }
    await page.screenshot({ path: path.join(SHOT_DIR, `${role.id}-03-after-start-process.png`), fullPage: true })

    // mgr-quality 和 mgr-equipment 不在 simple_approval 的 candidateGroups
    // 所以他们看不到"办理"链接,这是正确的
    const handleLink = page.getByRole('link', { name: /办理/ }).first()
    const hasHandle = await handleLink.isVisible().catch(() => false)
    if (hasHandle) {
      log(`[${role.id}] 看到"办理"链接 → 点击进入任务页`)
      await handleLink.click()
      await page.waitForURL(/portal\/workflow\/tasks\//, { timeout: 8000 })
      await page.screenshot({ path: path.join(SHOT_DIR, `${role.id}-04-task-page.png`), fullPage: true })
    } else {
      log(`[${role.id}] 未看到"办理"链接(position=${role.position} 不在 simple_approval 的 candidateGroups)`)
    }
  })
}

function log(msg) {
   
  console.log(msg)
}
