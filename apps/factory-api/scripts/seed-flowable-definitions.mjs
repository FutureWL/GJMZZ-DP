#!/usr/bin/env node
/**
 * 部署通用审批 BPMN 到 Flowable。
 * 用法:
 *   node scripts/seed-flowable-definitions.mjs
 *
 * 环境变量(可选,带默认):
 *   FLOWABLE_REST_BASE_URL  默认 http://localhost:33725/flowable-rest/service
 *   FLOWABLE_REST_USER      默认 rest-admin
 *   FLOWABLE_REST_PASSWORD  默认 test
 *   BPMN_DIR                默认 ../../infra/flowable/bpmn
 *
 * 退出码:
 *   0 全部成功
 *   1 Flowable 不可达
 *   2 部署失败
 */

import { readFile, readdir } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..', '..', '..')

const FLOWABLE_BASE = process.env.FLOWABLE_REST_BASE_URL ?? 'http://localhost:33725/flowable-rest/service'
const FLOWABLE_USER = process.env.FLOWABLE_REST_USER ?? 'rest-admin'
const FLOWABLE_PASSWORD = process.env.FLOWABLE_REST_PASSWORD ?? 'test'
const BPMN_DIR = resolve(ROOT, process.env.BPMN_DIR ?? 'infra/flowable/bpmn')

const basicAuth = 'Basic ' + Buffer.from(`${FLOWABLE_USER}:${FLOWABLE_PASSWORD}`).toString('base64')

function log(msg, level = 'info') {
  const prefix = level === 'error' ? '✗' : level === 'warn' ? '!' : '·'
   
  console.log(`[seed-flowable] ${prefix} ${msg}`)
}

async function healthCheck() {
  try {
    const res = await fetch(`${FLOWABLE_BASE}/management/engine`, {
      headers: { authorization: basicAuth },
    })
    if (!res.ok) {
      log(`engine healthcheck failed: ${res.status} ${res.statusText}`, 'error')
      return false
    }
    const j = await res.json()
    log(`engine OK: ${j.name ?? '(no name)'} version=${j.version ?? '?'}`)
    return true
  } catch (e) {
    log(`engine unreachable: ${e instanceof Error ? e.message : String(e)}`, 'error')
    return false
  }
}

async function deployBpmn(filePath) {
  const name = filePath.split('/').pop() ?? 'flowable-def'
  const xml = await readFile(filePath, 'utf8')

  const boundary = `----FactorySeed${Date.now()}`
  const head = `--${boundary}\r\nContent-Disposition: form-data; name="deploymentName"\r\n\r\n${name}\r\n`
  const fileHeader = `--${boundary}\r\nContent-Disposition: form-data; name="deployment"; filename="${name}"\r\nContent-Type: application/xml\r\n\r\n`
  const tail = `\r\n--${boundary}--\r\n`
  const body = head + fileHeader + xml + tail

  const res = await fetch(`${FLOWABLE_BASE}/repository/deployments`, {
    method: 'POST',
    headers: {
      authorization: basicAuth,
      'content-type': `multipart/form-data; boundary=${boundary}`,
    },
    body,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    log(`deploy ${name} failed: ${res.status} ${res.statusText} ${text.slice(0, 200)}`, 'error')
    return null
  }

  const deploy = await res.json()
  // 取该 deployment 下的 process definitions
  const list = await fetch(`${FLOWABLE_BASE}/repository/process-definitions?deploymentId=${deploy.id}`, {
    headers: { authorization: basicAuth },
  })
  const listJson = await list.json()
  const def = (listJson.data ?? [])[0]
  if (!def) {
    log(`deploy ${name} OK but no process-definition returned`, 'warn')
    return null
  }
  log(`deployed ${name} → key=${def.key} version=${def.version} id=${def.id}`)
  return def
}

async function main() {
  log(`FLOWABLE_BASE = ${FLOWABLE_BASE}`)
  log(`BPMN_DIR      = ${BPMN_DIR}`)

  if (!(await healthCheck())) {
    process.exit(1)
  }

  let files
  try {
    const all = await readdir(BPMN_DIR)
    files = all.filter((f) => f.endsWith('.bpmn20.xml') || f.endsWith('.bpmn')).sort()
  } catch (e) {
    log(`cannot read BPMN_DIR: ${e instanceof Error ? e.message : String(e)}`, 'error')
    process.exit(2)
  }

  if (!files.length) {
    log('no BPMN files found, nothing to deploy', 'warn')
    process.exit(0)
  }

  log(`found ${files.length} BPMN file(s): ${files.join(', ')}`)

  let allOk = true
  for (const f of files) {
    const def = await deployBpmn(join(BPMN_DIR, f))
    if (!def) allOk = false
  }

  if (!allOk) {
    log('one or more deployments failed', 'error')
    process.exit(2)
  }

  log('all BPMN files deployed')
  process.exit(0)
}

main().catch((e) => {
  log(`unhandled: ${e instanceof Error ? e.stack ?? e.message : String(e)}`, 'error')
  process.exit(2)
})
