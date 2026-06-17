#!/usr/bin/env node
/**
 * 一次性 seed 15 个 Keycloak 用户(高层 5 / 中层 5 / 基层 5)+ 同步写 public.profile。
 * - 通过 Keycloak admin REST 建用户 + reset-password
 * - 模拟每个用户登录拿 token,PUT /api/profiles/me 设 position/name/department
 *
 * 环境变量(可选,带默认):
 *   KC_URL       default http://sso.corp.aygjm.lan:18080
 *   REALM        default factory-platform
 *   ADMIN_USER   default admin
 *   ADMIN_PASS   default admin
 *   ADMIN_CLIENT default admin-cli
 *   API_BASE     default http://localhost:33700/api
 *   USER_CLIENT  default dev-cli
 *
 * 退出码:0 全部成功;1 部分失败。
 */

const KC_URL = process.env.KC_URL || 'http://sso.corp.aygjm.lan:18080'
const REALM = process.env.REALM || 'factory-platform'
const ADMIN_USER = process.env.ADMIN_USER || 'admin'
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin'
const ADMIN_CLIENT = process.env.ADMIN_CLIENT || 'admin-cli'
const API_BASE = process.env.API_BASE || 'http://localhost:33700/api'
const USER_CLIENT = process.env.USER_CLIENT || 'dev-cli'
const PASSWORD = process.env.PASSWORD || 'Pass1234!'

const USERS = [
  { id: 'ceo', name: '张总', email: 'ceo@aygjm.lan', position: 'approver', department: '总经办' },
  { id: 'ceo-deputy', name: '李副总', email: 'ceo.deputy@aygjm.lan', position: 'approver', department: '总经办' },
  { id: 'vp-sales', name: '王副总', email: 'vp.sales@aygjm.lan', position: 'approver', department: '营销中心' },
  { id: 'vp-mfg', name: '赵副总', email: 'vp.mfg@aygjm.lan', position: 'approver', department: '制造中心' },
  { id: 'vp-finance', name: '陈总监', email: 'vp.finance@aygjm.lan', position: 'approver', department: '财务中心' },
  { id: 'mgr-production', name: '钱经理', email: 'mgr.production@aygjm.lan', position: 'manager', department: '制造中心' },
  { id: 'mgr-quality', name: '孙经理', email: 'mgr.quality@aygjm.lan', position: 'quality_manager', department: '质量中心' },
  { id: 'mgr-procurement', name: '周经理', email: 'mgr.procurement@aygjm.lan', position: 'approver', department: '采购中心' },
  { id: 'mgr-equipment', name: '吴经理', email: 'mgr.equipment@aygjm.lan', position: 'plant_manager', department: '设备中心' },
  { id: 'mgr-it', name: '郑经理', email: 'mgr.it@aygjm.lan', position: 'approver', department: '信息中心' },
  { id: 'worker-leader', name: '冯班组长', email: 'worker.leader@aygjm.lan', position: 'approver', department: '生产一部' },
  { id: 'planner', name: '陈计划员', email: 'planner@aygjm.lan', position: 'approver', department: '生产计划部' },
  { id: 'inspector', name: '褚检验员', email: 'inspector@aygjm.lan', position: 'quality', department: '质量中心' },
  { id: 'tech', name: '卫维修', email: 'tech@aygjm.lan', position: 'plant_manager', department: '设备中心' },
  { id: 'warehouse', name: '蒋库管', email: 'warehouse@aygjm.lan', position: 'approver', department: '仓储中心' },
]

function log(msg) { console.log(`[seed] ${msg}`) }
function err(msg) { console.error(`[seed] FAIL: ${msg}`) }

async function getAdminToken() {
  const body = new URLSearchParams({
    grant_type: 'password',
    client_id: ADMIN_CLIENT,
    username: ADMIN_USER,
    password: ADMIN_PASS,
  })
  const res = await fetch(`${KC_URL}/realms/master/protocol/openid-connect/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) {
    const t = await res.text().catch(() => '')
    throw new Error(`admin token failed: ${res.status} ${t}`)
  }
  const j = await res.json()
  return j.access_token
}

async function listExistingUsers(adminToken) {
  const res = await fetch(`${KC_URL}/admin/realms/${REALM}/users?max=500`, {
    headers: { authorization: `Bearer ${adminToken}` },
  })
  if (!res.ok) throw new Error(`list users: ${res.status}`)
  return await res.json()
}

async function upsertUser(adminToken, user, existing) {
  const found = existing.find((u) => u.username === user.id)
  let userId
  if (found) {
    userId = found.id
    // update basic fields
    // 注意:Keycloak 26 要求 lastName 非空,否则 login 报 "Account is not fully set up"
    await fetch(`${KC_URL}/admin/realms/${REALM}/users/${userId}`, {
      method: 'PUT',
      headers: { authorization: `Bearer ${adminToken}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        username: user.id,
        email: user.email,
        firstName: user.name,
        lastName: user.name,  // Keycloak 26: 不能为空
        enabled: true,
        emailVerified: true,
      }),
    })
  } else {
    const res = await fetch(`${KC_URL}/admin/realms/${REALM}/users`, {
      method: 'POST',
      headers: { authorization: `Bearer ${adminToken}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        username: user.id,
        email: user.email,
        firstName: user.name,
        lastName: user.name,  // Keycloak 26: 不能为空
        enabled: true,
        emailVerified: true,
      }),
    })
    if (res.status !== 201) {
      const t = await res.text().catch(() => '')
      throw new Error(`create user ${user.id}: ${res.status} ${t}`)
    }
    // 拿到新建的 userId
    const loc = res.headers.get('location') || ''
    userId = loc.split('/').pop()
  }

  // 重置密码
  const pwdRes = await fetch(`${KC_URL}/admin/realms/${REALM}/users/${userId}/reset-password`, {
    method: 'PUT',
    headers: { authorization: `Bearer ${adminToken}`, 'content-type': 'application/json' },
    body: JSON.stringify({ type: 'password', value: PASSWORD, temporary: false }),
  })
  if (!pwdRes.ok && pwdRes.status !== 204) {
    const t = await pwdRes.text().catch(() => '')
    throw new Error(`reset password ${user.id}: ${pwdRes.status} ${t}`)
  }
  return userId
}

async function getUserToken(userId) {
  const body = new URLSearchParams({
    grant_type: 'password',
    client_id: USER_CLIENT,
    username: userId,
    password: PASSWORD,
  })
  const res = await fetch(`${KC_URL}/realms/${REALM}/protocol/openid-connect/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) {
    const t = await res.text().catch(() => '')
    throw new Error(`user token ${userId}: ${res.status} ${t}`)
  }
  const j = await res.json()
  return j.access_token
}

async function setProfile(userId, position, name, department) {
  const token = await getUserToken(userId)
  const res = await fetch(`${API_BASE}/profiles/me`, {
    method: 'PUT',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ position, name, department }),
  })
  if (!res.ok) {
    const t = await res.text().catch(() => '')
    throw new Error(`set profile ${userId}: ${res.status} ${t}`)
  }
  return await res.json()
}

async function main() {
  log(`KC_URL=${KC_URL} REALM=${REALM} API_BASE=${API_BASE}`)
  log('Step 1: admin token...')
  const adminToken = await getAdminToken()
  log('Step 2: list existing users...')
  const existing = await listExistingUsers(adminToken)
  log(`  existing ${existing.length} users`)

  log('Step 3: upsert 15 users + reset password...')
  const idMap = {}
  for (const u of USERS) {
    try {
      const userId = await upsertUser(adminToken, u, existing)
      idMap[u.id] = userId
      log(`  ✓ user ${u.id} (id=${userId})`)
    } catch (e) {
      err(`  ${u.id}: ${e.message}`)
    }
  }

  log('Step 4: set profile.position for each user (login then PUT /profiles/me)...')
  for (const u of USERS) {
    try {
      const p = await setProfile(u.id, u.position, u.name, u.department)
      log(`  ✓ profile ${u.id} position=${p.position} name=${p.name} department=${p.department}`)
    } catch (e) {
      err(`  ${u.id}: ${e.message}`)
    }
  }

  log(`DONE: ${Object.keys(idMap).length} users + ${USERS.length} profiles`)
}

main().catch((e) => {
  err(e instanceof Error ? e.stack || e.message : String(e))
  process.exit(1)
})
