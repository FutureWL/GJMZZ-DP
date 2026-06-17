#!/usr/bin/env bash
# 角色 mgr-production(钱经理 · 生产经理)— 端到端 API smoke
# position=manager → simple_approval_v1 可办(approver,manager 组)
# 不参与 qc_exception(无 quality/plant_manager)

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=./common.sh
source "$SCRIPT_DIR/common.sh"

USER="mgr-production"
PASS="Pass1234!"

log() { printf '[test-mgr-production] %s\n' "$*"; }
fail() { printf '[test-mgr-production] FAIL: %s\n' "$*" >&2; exit 1; }


log "0) 隔离:清理所有 active 流程(preflight)"
reset_all_processes
log "1) 登录"
TOKEN=$(get_token "$USER" "$PASS")
[ -n "$TOKEN" ] || fail "未拿到 token"
log "  token len: ${#TOKEN}"

log "2) profile 校验"
PROFILE=$(get_profile "$TOKEN")
expect_contains "profile.position" "$PROFILE" '"position":"manager"'
expect_contains "profile.name"     "$PROFILE" '"name":"钱经理"'
expect_contains "profile.dept"     "$PROFILE" '"department":"制造中心"'

log "3) 菜单(应 ≥40 条,含生产域)"
MENU=$(get_menu "$TOKEN")
N=$(count_json "$MENU")
log "  菜单条目数: $N"
[ "$N" -ge 40 ] || fail "菜单 < 40,实际 $N"
expect_contains "菜单-排程"     "$MENU" '"/production/execution/scheduling"'
expect_contains "菜单-工单"     "$MENU" '"/production/execution/workorders"'
expect_contains "菜单-工厂总览" "$MENU" '"/production/dashboards/factory"'
expect_contains "菜单-审批中心" "$MENU" '"/management/approval"'

log "4) 启动 simple_approval(模拟'自己'提交生产异常 → 自审自批)"
BK="mgr-production-test-$(date +%s)"
START=$(start_simple_approval "$TOKEN" "$BK" "production_exception" '"amountTotal":6666,"factory":"F1"')
echo "$BK" > /tmp/last_bk
  PROC_ID=$(echo "$START" | python3 -c 'import json,sys;print(json.load(sys.stdin).get("id",""))')
[ -n "$PROC_ID" ] || fail "启动失败: $START"
log "  流程实例: $PROC_ID (bk=$BK)"
sleep 1

log "5) 拉自己的待办"
TASKS=$(get_my_tasks "$TOKEN")
TC=$(count_json "$TASKS")
log "  待办数: $TC"
[ "$TC" -ge 1 ] || fail "mgr-production 没有待办,实际 $TC"
TASK_ID=$(echo "$TASKS" | python3 -c 'import json,sys;print(json.load(sys.stdin)[0]["id"])')

log "6) 校验 active-task 的 candidateGroups 包含 manager"
ACT=$(curl -sS -m 5 "$API_BASE/workflow/process-instances/by-business-key/${TEST_PREFIX}-$BK/active-task" \
  -H "Authorization: Bearer $TOKEN")
echo "$ACT" | python3 -c '
import json,sys
t = json.load(sys.stdin).get("task") or {}
groups = t.get("candidateGroups") or []
print("  groups:", groups)
assert "manager" in groups or "approver" in groups, "manager/approver 都不在 candidateGroups"
print("  canAct: True (mgr-production.position=manager ∈ groups)")
'

log "7) 同意 → 流程结束"
RESULT=$(complete_task "$TOKEN" "$TASK_ID" "APPROVE" "mgr-production self approve")
expect_contains "complete" "$RESULT" '"ok":true'
sleep 1

log "8) 验证流程历史包含 approve_task"
HIST=$(curl -sS -m 5 "$API_BASE/workflow/process-instances/$PROC_ID/history" -H "Authorization: Bearer $TOKEN")
expect_contains "history" "$HIST" '"approve_task"'

log "9) 隔离验证:qc_exception 的 isolate(candidateGroups=[quality]) → mgr-production 不在"
QC_BK="qc-isolation-test-$(date +%s)"
MGR_TOKEN=$(get_token "vp-mfg" "Pass1234!")
QC_PROC=$(start_workflow "$MGR_TOKEN" "qc_exception_v1" "$QC_BK" \
  '{"businessType":"incident","severity":"high"}')
[ -n "$QC_PROC" ] || fail "qc_exception 启动失败"
log "  qc_exception 已启动 (bk=$(last_bk))"
# 拿 isolate 步骤的 candidateGroups,mgr-production.position=manager 必须在不在
QC_ACT=$(get_active_task_json "$TOKEN" "${TEST_PREFIX}-$QC_BK")
echo "$QC_ACT" | python3 -c '
import json,sys
t = json.load(sys.stdin).get("task") or {}
groups = t.get("candidateGroups") or []
print("  isolate candidateGroups:", groups)
assert "quality" in groups, "isolate 应在 quality 组"
assert "manager" not in groups and "approver" not in groups, "manager/approver 不应在 quality"
print("  mgr-production.position=manager 不在 groups ✓")
'
# 清理:跳过 isolate(用 Flowable REST)
ISOLATE_ID=$(curl -sS -m 5 -u "rest-admin:test" \
  "http://localhost:33725/flowable-rest/service/runtime/tasks?name=隔离&processInstanceId=$QC_PROC" \
  | python3 -c 'import json,sys
d=sys.stdin.read().strip()
if not d: print(""); sys.exit(0)
try:
  arr=(json.loads(d) or {}).get("data",[])
  print(arr[0]["id"] if arr else "")
except: print("")')
if [ -n "$ISOLATE_ID" ]; then
  curl -sS -m 5 -u "rest-admin:test" \
    -X POST "http://localhost:33725/flowable-rest/service/runtime/tasks/$ISOLATE_ID" \
    -H "Content-Type: application/json" -d '{"action":"complete"}' >/dev/null
fi

log "✅ 角色 mgr-production 通过"
