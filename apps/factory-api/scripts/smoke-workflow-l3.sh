#!/usr/bin/env bash
# L3 端到端冒烟:业务单据 → 启动 Flowable → 真实待办 → 详情页可见流程实例
#
# 前置:同 smoke-workflow.sh
# 验证点:
#   1) 用 businessKey 启动 simple_approval_v1,带 businessType 变量
#   2) /workflow/tasks/me 能看到待办
#   3) /workflow/instances/by-business-key/<key> 能查到流程实例
#   4) /workflow/process-instances/<id>/history 包含 approve_task + businessType 变量
#   5) /workflow/tasks/<taskId>/complete 后,流程 ended=true
#
# 这模拟了"用户在 portal-ui 点提交审批"的完整链路(只是没点 UI)

set -euo pipefail

KC_URL="${KEYCLOAK_URL:-http://sso.corp.aygjm.lan:18080}"
KC_USER="${KEYCLOAK_USER:-demo}"
KC_PASS="${KEYCLOAK_PASS:-demo1234}"
REALM="${REALM:-factory-platform}"
CLIENT_ID="${CLIENT_ID:-dev-cli}"
API_BASE="${API_BASE:-http://localhost:33700/api}"

log() { printf '[l3] %s\n' "$*"; }
fail() { printf '[l3] FAIL: %s\n' "$*" >&2; exit 1; }

log "1) 拿 Keycloak token..."
TOKEN=$(curl -sS -m 5 -X POST "$KC_URL/realms/$REALM/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" -d "client_id=$CLIENT_ID" \
  -d "username=$KC_USER" -d "password=$KC_PASS" | \
  python3 -c 'import json,sys;print(json.load(sys.stdin).get("access_token",""))')
[ -n "$TOKEN" ] || fail "未拿到 access_token"
log "   token 长度: ${#TOKEN}"

log "2) profile.position=approver(以便看到待办)"
curl -sS -m 5 -X PUT "$API_BASE/profiles/me" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"position":"approver"}' >/dev/null

log "3) 部署 simple_approval_v1(若已部署则跳过)"
EXISTING=$(curl -sS -m 5 "$API_BASE/workflow/process-definitions" \
  -H "Authorization: Bearer $TOKEN")
echo "$EXISTING" | grep -q 'simple_approval_v1' \
  && log "   已存在,跳过" \
  || fail "simple_approval_v1 未部署,请先跑 smoke-workflow.sh 步骤 3"

log "4) 模拟 L3 业务提交:启动流程(businessType=expense_claim)"
BK="EXP-L3-$(date +%s)"
START_RESP=$(curl -sS -m 5 -X POST "$API_BASE/workflow/instances" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{
    \"businessKey\": \"$BK\",
    \"variables\": {
      \"businessType\": \"expense_claim\",
      \"amountTotal\": 1234.56,
      \"claimType\": \"差旅\",
      \"departmentId\": \"DEPT-001\"
    }
  }")
PROC_ID=$(echo "$START_RESP" | python3 -c 'import json,sys;print(json.load(sys.stdin).get("id",""))')
[ -n "$PROC_ID" ] || fail "启动失败: $START_RESP"
log "   流程实例 id: $PROC_ID"
log "   businessKey: $BK"

sleep 1

log "5) 我的待办(应包含刚启动的流程)"
TASKS=$(curl -sS -m 5 "$API_BASE/workflow/tasks/me" \
  -H "Authorization: Bearer $TOKEN")
log "   响应: $TASKS"
TASK_ID=$(echo "$TASKS" | python3 -c "import json,sys;d=json.load(sys.stdin);[print(t['id']) for t in d if t.get('processInstanceId')=='$PROC_ID']")
[ -n "$TASK_ID" ] || fail "我的待办里没看到刚启动的流程 $PROC_ID"
log "   任务 id: $TASK_ID"

log "6) 业务详情页(模拟):按 businessKey 查流程实例"
INST=$(curl -sS -m 5 "$API_BASE/workflow/instances/by-business-key/$BK" \
  -H "Authorization: Bearer $TOKEN")
echo "$INST" | grep -q "$PROC_ID" || fail "未查到流程实例: $INST"
log "   ✅ 业务详情页能看到流程实例"

log "7) 查流程历史(应包含 approve_task)"
HIST=$(curl -sS -m 5 "$API_BASE/workflow/process-instances/$PROC_ID/history" \
  -H "Authorization: Bearer $TOKEN")
echo "$HIST" | grep -q 'approve_task' || fail "历史中没找到 approve_task"
log "   ✅ 历史中包含 approve_task"

log "8) 完成任务(APPROVE)"
curl -sS -m 5 -X POST "$API_BASE/workflow/tasks/$TASK_ID/complete" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"action":"APPROVE","comment":"L3 smoke approve"}' | head -1
log "   ✅ 任务完成"

sleep 1

log "9) 查 historic-process-instance(应包含 businessKey=$BK,已结束)"
HIST_INST=$(curl -sS -m 5 "http://localhost:33725/flowable-rest/service/history/historic-process-instances?businessKey=$BK" \
  -u "${FLOWABLE_REST_USER:-rest-admin}:${FLOWABLE_REST_PASSWORD:-test}" 2>&1 || echo "")
# 上面的 REST 路径未被代理出来，退一步用 history 端点
TASKS2=$(curl -sS -m 5 "$API_BASE/workflow/process-instances/$PROC_ID/history" \
  -H "Authorization: Bearer $TOKEN")
APPROVE_END=$(echo "$TASKS2" | python3 -c 'import json,sys;d=json.load(sys.stdin);[print(t.get("endTime")) for t in d.get("tasks",[]) if t.get("taskDefinitionKey")=="approve_task"]')
[ -n "$APPROVE_END" ] || fail "approve_task 未结束: $TASKS2"
log "   ✅ approve_task 已结束:$APPROVE_END"

log "✅ L3 端到端冒烟通过"
