#!/usr/bin/env node
/**
 * 生成并执行菜单 seed SQL
 * 数据来源:apps/portal-ui/src/app/api/menus.ts 的 MOCK_MENU_JSON
 * 输出:
 *   - infra/db-init/factory-03-menus.sql(供 db-init 容器持久化)
 *   - 直接 psql 执行
 *
 * 用法:
 *   node scripts/seed-menus.mjs                # 生成 SQL + 执行到 db
 *   node scripts/seed-menus.mjs --no-exec      # 只生成 SQL,不执行
 *   node scripts/seed-menus.mjs --sql-only     # 只打印 SQL 到 stdout
 */

import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..', '..', '..')

const MENUS_TS = resolve(ROOT, 'apps/portal-ui/src/app/api/menus.ts')
const OUT_SQL = resolve(ROOT, 'infra/db-init/factory-03-menus.sql')

const args = new Set(process.argv.slice(2))
const NO_EXEC = args.has('--no-exec')
const SQL_ONLY = args.has('--sql-only')

function log(msg) {
  // eslint-disable-next-line no-console
  console.log(`[seed-menus] ${msg}`)
}

// 把 JS 源里的 MOCK_MENU_JSON 提出来,eval 出数组
async function extractMockMenu() {
  const src = await readFile(MENUS_TS, 'utf8')
  // 找 const MOCK_MENU_JSON = JSON.stringify( ... ); 的右括号
  const start = src.indexOf('const MOCK_MENU_JSON = JSON.stringify(')
  if (start < 0) throw new Error('MOCK_MENU_JSON not found in menus.ts')
  // 跳过等号到第一个 '('
  const after = start + 'const MOCK_MENU_JSON = JSON.stringify'.length
  if (src[after] !== '(') throw new Error('Expected ( after JSON.stringify')
  // 按括号深度匹配右括号
  let depth = 0
  let i = after
  let inStr = null // null | "'" | '"' | '`'
  for (; i < src.length; i++) {
    const ch = src[i]
    if (inStr) {
      if (ch === '\\') {
        i++ // skip escaped char
        continue
      }
      if (ch === inStr) inStr = null
      continue
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      inStr = ch
      continue
    }
    if (ch === '(') depth++
    else if (ch === ')') {
      depth--
      if (depth === 0) break
    }
  }
  if (depth !== 0) throw new Error('MOCK_MENU_JSON paren mismatch')
  // after+1 .. i-1 是 JSON.stringify 的参数(JS 数组字面量)
  // JS 单引号不是合法 JSON, 用 new Function 评估
  const inner = src.slice(after + 1, i)
  return new Function('return (' + inner + ')')()
}

// SQL 转义
function sqlStr(v) {
  if (v === null || v === undefined) return 'null'
  return `'${String(v).replace(/'/g, "''")}'`
}
function sqlBool(v) {
  return v ? 'true' : 'false'
}
function sqlInt(v) {
  return v === null || v === undefined ? '0' : String(Number.isFinite(Number(v)) ? Number(v) : 0)
}
function sqlTextArray(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return 'null'
  const escaped = arr.map((s) => `"${String(s).replace(/"/g, '""')}"`).join(',')
  return `'{${escaped}}'`
}

function generateSql(items) {
  const lines = []
  lines.push('-- Auto-generated from apps/portal-ui/src/app/api/menus.ts (MOCK_MENU_JSON)')
  lines.push('-- DO NOT EDIT BY HAND;regenerate via apps/factory-api/scripts/seed-menus.mjs')
  lines.push('')
  lines.push('create table if not exists public.menu_item (')
  lines.push('  id            text primary key,')
  lines.push('  portal_id     text not null,')
  lines.push('  parent_id     text references public.menu_item(id) on delete cascade,')
  lines.push('  label         text not null,')
  lines.push('  path          text,')
  lines.push('  icon_name     text,')
  lines.push('  sort_order    integer not null default 0,')
  lines.push('  required_roles text[],')
  lines.push('  enabled       boolean not null default true,')
  lines.push('  created_at    timestamptz not null default now(),')
  lines.push('  updated_at    timestamptz not null default now()')
  lines.push(');')
  lines.push('')
  lines.push('create index if not exists menu_item_portal_idx on public.menu_item (portal_id);')
  lines.push('create index if not exists menu_item_parent_idx on public.menu_item (parent_id);')
  lines.push('create index if not exists menu_item_sort_idx on public.menu_item (portal_id, sort_order);')
  lines.push('')
  // 清空再插入(保证幂等)
  lines.push('truncate table public.menu_item restart identity cascade;')
  lines.push('')
  // 排序:先 parent,后 child(虽然 truncate 了,排序让 SQL 可读性更好)
  const sorted = [...items].sort((a, b) => {
    if (a.parentId === b.parentId) return a.sortOrder - b.sortOrder
    if (a.parentId === null) return -1
    if (b.parentId === null) return 1
    return a.parentId.localeCompare(b.parentId)
  })
  lines.push("insert into public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled) values")
  const values = sorted.map((it) => {
    return `  (${sqlStr(it.id)}, ${sqlStr(it.portalId)}, ${sqlStr(it.parentId)}, ${sqlStr(it.label)}, ${sqlStr(it.path)}, ${sqlStr(it.iconName)}, ${sqlInt(it.sortOrder)}, ${sqlTextArray(it.requiredRoles)}, ${sqlBool(true)})`
  })
  lines.push(values.join(',\n') + ';')
  lines.push('')
  return lines.join('\n')
}

function execSql(sql) {
  // 用 docker exec 跑 psql
  const r = spawnSync(
    'docker',
    ['exec', '-i', 'factory-platform-db-1', 'psql', '-U', 'factory', '-d', 'factory', '-v', 'ON_ERROR_STOP=1'],
    { input: sql, encoding: 'utf8' },
  )
  if (r.status !== 0) {
    process.stderr.write(r.stdout || '')
    process.stderr.write(r.stderr || '')
    throw new Error(`psql exit ${r.status}`)
  }
  return (r.stdout || '').trim()
}

async function main() {
  log(`source: ${MENUS_TS}`)
  const items = await extractMockMenu()
  log(`parsed ${items.length} menu items`)

  const sql = generateSql(items)
  log(`generated SQL: ${sql.length} bytes, ${sql.split('\n').length} lines`)

  // 写到 infra/db-init/(同步供后续 db-init 容器使用)
  await writeFile(OUT_SQL, sql, 'utf8')
  log(`wrote ${OUT_SQL}`)

  if (SQL_ONLY) {
    process.stdout.write(sql)
    return
  }

  if (NO_EXEC) {
    log('--no-exec, skip applying')
    return
  }

  log('applying to factory db...')
  const out = execSql(sql)
  process.stdout.write(out + '\n')

  // 验证
  const v = spawnSync(
    'docker',
    ['exec', 'factory-platform-db-1', 'psql', '-U', 'factory', '-d', 'factory', '-tAc', "select count(*) from public.menu_item"],
    { encoding: 'utf8' },
  )
  log(`verify: menu_item rows = ${v.stdout.trim()}`)
}

main().catch((e) => {
  console.error('[seed-menus] FAIL:', e instanceof Error ? e.message : String(e))
  process.exit(1)
})
