// @ts-check
// 手动验证 inspector 登录后的视觉效果(对比 inspector vs ceo)
import { chromium } from '@playwright/test'
import fs from 'node:fs'

const BASE_URL = 'http://127.0.0.1:33700'
const SHOT_DIR = '/root/DataDisk/workspace/GJMZZ-DP/requirements/08_role-journeys/e2e-screenshots/manual-verify'
if (!fs.existsSync(SHOT_DIR)) fs.mkdirSync(SHOT_DIR, { recursive: true })

const browser = await chromium.launch({ headless: true })

async function captureFor(user, pass, suffix) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()

  await page.goto(`${BASE_URL}/portal/`)
  await page.waitForURL(/portal\/login/, { timeout: 10000 })
  await page.getByRole('button', { name: /SSO 登录/ }).click()
  await page.waitForURL(/protocol\/openid-connect\/auth/, { timeout: 15000 })
  await page.fill('#username', user)
  await page.fill('#password', pass)
  await page.getByRole('button', { name: /Sign In|登录/ }).click()
  await page.waitForURL(/127\.0\.0\.1:33700/, { timeout: 25000 })
  await page.waitForLoadState('networkidle', { timeout: 15000 })
  await page.waitForTimeout(1500)

  // 展开所有折叠菜单
  await page.evaluate(() => {
    const buttons = document.querySelectorAll('aside button[aria-expanded="false"], nav button[aria-expanded="false"]')
    buttons.forEach((b) => (b).click())
  })
  await page.waitForTimeout(500)

  // 截全页
  await page.screenshot({ path: `${SHOT_DIR}/03-${suffix}-fullpage.png`, fullPage: true })
  // 截侧边栏
  const sidebar = await page.locator('aside, nav').first()
  await sidebar.screenshot({ path: `${SHOT_DIR}/04-${suffix}-sidebar.png` })

  // 提取菜单文本
  const items = await page.evaluate(() => {
    const arr = []
    for (const el of document.querySelectorAll('aside a, aside button, nav a, nav button')) {
      const text = (el.textContent || '').trim()
      if (text) arr.push(text)
    }
    return arr
  })

  await ctx.close()
  return items
}

console.log('[A] inspector 登录 → 截图(展开全部菜单)...')
const inspectorItems = await captureFor('inspector', 'Pass1234!', 'inspector')
console.log('   ✓ 03-inspector-fullpage.png + 04-inspector-sidebar.png')
console.log('   菜单项数:', inspectorItems.length)

console.log('\n[B] ceo 登录 → 截图(对照)...')
const ceoItems = await captureFor('ceo', 'Pass1234!', 'ceo')
console.log('   ✓ 03-ceo-fullpage.png + 04-ceo-sidebar.png')
console.log('   菜单项数:', ceoItems.length)

await browser.close()

console.log('\n============================================')
console.log(`inspector (quality) 看到 ${inspectorItems.length} 项:`)
console.log('============================================')
inspectorItems.forEach((t, i) => console.log(`  ${i + 1}. ${t}`))

console.log('\n============================================')
console.log(`ceo (approver) 看到 ${ceoItems.length} 项:`)
console.log('============================================')
ceoItems.forEach((t, i) => console.log(`  ${i + 1}. ${t}`))

console.log('\n============================================')
console.log('对比(inspector 没有但 ceo 有的):')
console.log('============================================')
const setI = new Set(inspectorItems)
ceoItems.filter((t) => !setI.has(t)).forEach((t, i) => console.log(`  ${i + 1}. ${t}`))