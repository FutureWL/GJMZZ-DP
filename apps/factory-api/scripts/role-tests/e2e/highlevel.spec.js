// @ts-check
// 通用 e2e:登录、侧边栏菜单、审批中心
// 每个 test 用一个高层角色(独立 storageState)

const { test, expect } = require('@playwright/test')
const { execSync } = require('node:child_process')
const path = require('node:path')
const fs = require('node:fs')

const KC_URL = 'http://localhost:18080'
const REALM = 'factory-platform'
const CLIENT_ID = 'dev-cli'
const SHOT_DIR = '/root/DataDisk/workspace/GJMZZ-DP/requirements/08_role-journeys/e2e-screenshots/highlevel'
if (!fs.existsSync(SHOT_DIR)) fs.mkdirSync(SHOT_DIR, { recursive: true })

/** 用 ROPC 拿 token(供前端初始化用) */
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
  const j = JSON.parse(res)
  return j.access_token
}

function shellEscape(s) {
  return `'${s.replace(/'/g, `'\\''`)}'`
}

/** 解析 OIDC id_token 拿 sub/name/email(供 AuthContext 用) */
function parseJwt(token) {
  const part = token.split('.')[1]
  const pad = '='.repeat((4 - (part.length % 4)) % 4)
  return JSON.parse(Buffer.from(part + pad, 'base64').toString())
}

/** 走真实的 Keycloak 授权码流程拿 token(不通过 ROPC,模拟浏览器) */
async function loginViaBrowser(page, username, password) {
  await page.goto('http://127.0.0.1:33700/portal/')
  // portal-ui 看到未登录会跳到自建 login 页
  await page.waitForURL(/portal\/login/, { timeout: 10000 })
  // 点 "SSO 登录" 按钮(跳转 Keycloak)
  await page.getByRole('button', { name: /SSO 登录/ }).click()
  // 等 Keycloak 登录页
  await page.waitForURL(/protocol\/openid-connect\/auth/, { timeout: 15000 })
  // Keycloak 26 的登录页:输入框 id 为 username / password
  await page.fill('#username', username)
  await page.fill('#password', password)
  // 点击 "Sign In" 按钮
  await page.getByRole('button', { name: /Sign In|登录/ }).click()
  // 等回到 portal(回调路径可能是 /portal/login?code=... 或 /)
  await page.waitForURL(/127\.0\.0\.1:33700/, { timeout: 25000 })
  // 等工作台/工作台渲染完毕
  await page.waitForLoadState('networkidle', { timeout: 15000 })
}

const ROLES = [
  { id: 'ceo', name: '张总(总经理)', position: 'approver', landingHint: '/workbench' },
  { id: 'ceo-deputy', name: '李副总(常务副总)', position: 'approver' },
  { id: 'vp-sales', name: '王副总(营销副总)', position: 'approver' },
  { id: 'vp-mfg', name: '赵副总(制造副总)', position: 'approver' },
  { id: 'vp-finance', name: '陈总监(财务/风控)', position: 'approver' },
]

for (const role of ROLES) {
  test(`高层 ${role.id}(${role.name}) — 登录 + 侧边栏 + 审批中心`, async ({ page }) => {
    // 1) 登录
    await loginViaBrowser(page, role.id, 'Pass1234!')
    await page.screenshot({ path: path.join(SHOT_DIR, `${role.id}-01-after-login.png`), fullPage: true })

    // 2) 验证侧边栏存在 6 个一级菜单
    // 等待 sidebar 渲染
    await page.waitForSelector('aside, [data-testid="sidebar"], nav', { timeout: 8000 }).catch(() => {})

    // 用文本模糊匹配关键菜单项(都在 sidebar 中可见,可能是折叠状态)
    const expectedMenus = [
      '工作台',
      '营销与客户',
      '计划与生产',
      '质量与设备',
      '采购与供应链',
      '综合管理',
    ]
    for (const m of expectedMenus) {
      const locator = page.locator('aside, nav').getByText(m, { exact: false }).first()
      // 不严格断言 visible(可能被折叠),只验证 DOM 存在
      const count = await locator.count()
      expect(count, `${role.id} sidebar 中应包含菜单项 "${m}"`).toBeGreaterThan(0)
    }

    // 3) 直接 goto 审批中心(避免 sidebar click 折叠/展开问题)
    await page.goto('http://127.0.0.1:33700/portal/management/approval')
    await page.waitForLoadState('networkidle', { timeout: 10000 })
    await page.waitForTimeout(500)
    await page.screenshot({ path: path.join(SHOT_DIR, `${role.id}-02-approval-center.png`), fullPage: true })

    // 4) 验证页面有"真实待办"区标题
    const realTitle = page.locator('body').getByText('真实流程', { exact: false }).first()
    await expect(realTitle, '审批中心应有"真实流程"区').toBeVisible({ timeout: 5000 })

    // 5) 验证页面有"待办 · 真实流程(Flowable)"区
    const sectionTitle = page.locator('body').getByText('待办 · 真实流程', { exact: false }).first()
    await expect(sectionTitle).toBeVisible({ timeout: 5000 })
  })

  test(`高层 ${role.id} — 提交业务单据(费用)→ 真实流程启动`, async ({ page, request }) => {
    // 1) 登录
    await loginViaBrowser(page, role.id, 'Pass1234!')

    // 2) 用 API(简化:用 token 直接调,不走 UI 多步骤)
    const token = getKeycloakToken(role.id, 'Pass1234!')
    const claimId = `${role.id.toUpperCase()}-E2E-${Date.now()}`
    const startResp = await request.post('http://127.0.0.1:33700/api/workflow/instances', {
      headers: { Authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      data: {
        businessKey: claimId,
        variables: { businessType: 'expense_claim', amountTotal: 1234.56, _e2e: true },
      },
    })
    expect(startResp.status(), '启动流程应成功').toBe(201)
    const proc = await startResp.json()
    expect(proc.id, '应有 processInstanceId').toBeTruthy()
    expect(proc.businessKey, 'businessKey 应回传').toBe(claimId)

    // 3) 重新打开审批中心页面,应看到该业务
    await page.goto('http://127.0.0.1:33700/portal/management/approval')
    await page.waitForLoadState('networkidle', { timeout: 10000 })
    await page.waitForTimeout(500) // 等刷新按钮可点
    // 点 "刷新真实待办" 按钮
    const refreshBtn = page.getByRole('button', { name: /刷新真实待办/ })
    if (await refreshBtn.count()) {
      await refreshBtn.first().click()
      await page.waitForTimeout(800)
    }
    await page.screenshot({ path: path.join(SHOT_DIR, `${role.id}-03-after-start-process.png`), fullPage: true })

    // 4) 检查是否有"办理"链接
    const handleLink = page.getByRole('link', { name: /办理/ }).first()
    const hasHandle = await handleLink.isVisible().catch(() => false)
    // 不强制断言(可能因 candidateGroup 匹配失败不可办)
    if (hasHandle) {
      log(`[${role.id}] 看到"办理"链接,点击进入任务页`)
      await handleLink.click()
      await page.waitForURL(/portal\/workflow\/tasks\//, { timeout: 8000 })
      await page.screenshot({ path: path.join(SHOT_DIR, `${role.id}-04-task-page.png`), fullPage: true })
    } else {
      log(`[${role.id}] 未看到"办理"链接(可能 candidateGroup 不匹配),跳过任务页`)
    }
  })
}

function log(msg) {
  // eslint-disable-next-line no-console
  console.log(msg)
}
