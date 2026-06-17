#!/usr/bin/env bash
# 端到端冒烟测试:验证 L1+L2 真实接入 Flowable
# 前置:
#   1. factory-api 已启动(默认 33704)
#   2. Flowable REST 已启动(默认 33725)
#   3. Keycloak 已启动(默认 18080)
#   4. 已有 Keycloak 测试用户,且 profile.position=approver
#
# 用法:
#   KEYCLOAK_URL=http://sso.corp.aygjm.lan:18080 \
#   KEYCLOAK_USER=alice KEYCLOAK_PASS=alice \
#   REALM=factory-platform CLIENT_ID=portal-ui \
#   ./scripts/smoke-workflow.sh
#
# 它会:
#   1) 用 password grant 拿 access_token
#   2) 确保 profile.position=approver(PUT /api/profiles/me)
#   3) 部署 simple_approval_v1 BPMN(若已部署则跳过)
#   4) 启动流程(businessKey=test-bk-001)
#   5) 列我的待办(应看到 1 条)
#   6) 完成任务(APPROVE)
#   7) 再列待办(应为空)
#
# 退出码:0 全部通过;非 0 失败

set -euo pipefail

KC_URL="${KEYCLOAK_URL:-http://sso.corp.aygjm.lan:18080}"
KC_USER="${KEYCLOAK_USER:-alice}"
KC_PASS="${KEYCLOAK_PASS:-alice}"
REALM="${REALM:-factory-platform}"
CLIENT_ID="${CLIENT_ID:-portal-ui}"
API_BASE="${API_BASE:-http://localhost:33704/api}"

log() { printf '[smoke] %s\n' "$*"; }
fail() { printf '[smoke] FAIL: %s\n' "$*" >&2; exit 1; }

log "1) 拿 Keycloak token (resource owner password grant)..."
TOKEN=$(curl -sX POST "$KC_URL/realms/$REALM/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=$CLIENT_ID" \
  -d "username=$KC_USER" \
  -d "password=$KC_PASS" | \
  python3 -c 'import json,sys;d=json.load(sys.stdin);print(d.get("access_token",""))')

if [ -z "$TOKEN" ]; then
  fail "未拿到 access_token(用户 $KC_USER 不存在或密码错)。先在 Keycloak 创建用户。"
fi
log "   token 长度: ${#TOKEN}"

log "2) 确保 profile.position=approver"
curl -sX PUT "$API_BASE/profiles/me" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"position":"approver"}' >/dev/null
PROFILE=$(curl -sX GET "$API_BASE/profiles/me" \
  -H "Authorization: Bearer $TOKEN")
log "   当前 profile: $PROFILE"
echo "$PROFILE" | grep -q '"position":"approver"' || fail "profile.position 未生效"

log "3) 部署 simple_approval_v1 BPMN(若已部署则跳过)"
EXISTING=$(curl -sX GET "$API_BASE/workflow/process-definitions" \
  -H "Authorization: Bearer $TOKEN")
echo "$EXISTING" | grep -q 'simple_approval_v1' \
  && log "   已存在,跳过" \
  || {
    log "   不存在,部署..."
    BPMN_DIR="$(cd "$(dirname "$0")/../../../infra/flowable/bpmn" && pwd)"
    XML=$(cat "$BPMN_DIR/simple-approval-v1.bpmn20.xml")
    # 构造 JSON
    JSON=$(python3 -c "import json,sys;print(json.dumps({'name':'simple-approval-v1','bpmnXml':sys.stdin.read()}))" <<< "$XML")
    DEPLOY_RESP=$(curl -sX POST "$API_BASE/workflow/process-definitions" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "$JSON")
    log "   部署结果: $DEPLOY_RESP"
    echo "$DEPLOY_RESP" | grep -q '"key":"simple_approval_v1"' || fail "部署失败"
  }

log "4) 启动流程(businessKey=test-bk-$(date +%s))"
BK="test-bk-$(date +%s)"
START_RESP=$(curl -sX POST "$API_BASE/workflow/instances" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"businessKey\":\"$BK\",\"variables\":{\"businessType\":\"smoke\"}}")
log "   启动结果: $START_RESP"
echo "$START_RESP" | grep -q '"id"' || fail "启动流程失败"
PROC_ID=$(echo "$START_RESP" | python3 -c 'import json,sys;print(json.load(sys.stdin).get("id",""))')
log "   流程实例 id: $PROC_ID"

# 给 Flowable 一点时间把任务落库
sleep 1

log "5) 列我的待办"
TASKS=$(curl -sX GET "$API_BASE/workflow/tasks/me" \
  -H "Authorization: Bearer $TOKEN")
log "   响应: $TASKS"
TASK_ID=$(echo "$TASKS" | python3 -c 'import json,sys;d=json.load(sys.stdin);print(d[0]["id"] if d else "")')
if [ -z "$TASK_ID" ]; then
  fail "我的待办为空(可能 profile.position 不是 approver/manager,或流程未把任务分到该组)"
fi
log "   任务 id: $TASK_ID"

log "6) 完成任务(APPROVE)"
COMPLETE_RESP=$(curl -sX POST "$API_BASE/workflow/tasks/$TASK_ID/complete" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"APPROVE","comment":"smoke test approve"}')
log "   响应: $COMPLETE_RESP"

log "7) 再列我的待办(应为空)"
TASKS2=$(curl -sX GET "$API_BASE/workflow/tasks/me" \
  -H "Authorization: Bearer $TOKEN")
log "   响应: $TASKS2"
echo "$TASKS2" | grep -q '"id"' && fail "完成后仍有待办" || log "   ✅ 待办已清空"

log "8) 查流程历史"
HIST=$(curl -sX GET "$API_BASE/workflow/process-instances/$PROC_ID/history" \
  -H "Authorization: Bearer $TOKEN")
log "   历史: $HIST"
echo "$HIST" | grep -q 'approve_task' || fail "历史中未找到 approve_task"

log "✅ 端到端冒烟测试通过"
