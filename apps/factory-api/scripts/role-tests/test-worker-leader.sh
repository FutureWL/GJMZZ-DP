#!/usr/bin/env bash
# 角色 worker-leader(冯班组长 · 产线班组长)— 端到端 API smoke
# position=approver → simple_approval 可办
# 不参与 qc_exception(无 quality/plant_manager)

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=./common.sh
source "$SCRIPT_DIR/common.sh"

USER="worker-leader"
PASS="Pass1234!"

log() { printf '[test-worker-leader] %s\n' "$*"; }
fail() { printf '[test-worker-leader] FAIL: %s\n' "$*" >&2; exit 1; }


log "0) 隔离:清理所有 active 流程(preflight)"
reset_all_processes
log "1) 登录"
TOKEN=$(get_token "$USER" "$PASS")
[ -n "$TOKEN" ] || fail "未拿到 token"

log "2) profile 校验"
PROFILE=$(get_profile "$TOKEN")
expect_contains "profile.position" "$PROFILE" '"position":"approver"'
expect_contains "profile.name"     "$PROFILE" '"name":"冯班组长"'
expect_contains "profile.dept"     "$PROFILE" '"department":"生产一部"'

log "3) 菜单(产线相关)"
MENU=$(get_menu "$TOKEN")
N=$(count_json "$MENU")
log "  菜单条目数: $N"
[ "$N" -ge 40 ] || fail "菜单 < 40"
expect_contains "菜单-排程"     "$MENU" '"/production/execution/scheduling"'
expect_contains "菜单-工单"     "$MENU" '"/production/execution/workorders"'
expect_contains "菜单-派工任务" "$MENU" '"/production/execution/dispatch"'
expect_contains "菜单-报工"     "$MENU" '"/production/execution/reporting"'

log "4) simple_approval 自审自批(产线异常报告)"
BK="worker-leader-test-$(date +%s)"
START=$(start_simple_approval "$TOKEN" "$BK" "line_exception" '"amountTotal":2000,"line":"L3","shift":"夜班"')
echo "$BK" > /tmp/last_bk
PROC_ID=$(echo "$START" | python3 -c 'import json,sys;print(json.load(sys.stdin).get("id",""))')
[ -n "$PROC_ID" ] || fail "启动失败"
log "  流程: $PROC_ID"
sleep 1

log "5) 拉自己的待办"
TASKS=$(get_my_tasks "$TOKEN")
TC=$(count_json "$TASKS")
log "  待办数: $TC"
[ "$TC" -ge 1 ] || fail "无待办"
TASK_ID=$(echo "$TASKS" | python3 -c 'import json,sys;print(json.load(sys.stdin)[0]["id"])')

log "6) 校验 candidateGroups 包含 approver"
ACT=$(curl -sS -m 5 "$API_BASE/workflow/process-instances/by-business-key/${TEST_PREFIX}-$BK/active-task" \
  -H "Authorization: Bearer $TOKEN")
echo "$ACT" | python3 -c '
import json,sys
t = json.load(sys.stdin).get("task") or {}
groups = t.get("candidateGroups") or []
print("  groups:", groups)
assert "approver" in groups
print("  canAct: True")
'

log "7) 同意 → 流程结束"
RESULT=$(complete_task "$TOKEN" "$TASK_ID" "APPROVE" "worker-leader self approve")
expect_contains "complete" "$RESULT" '"ok":true'

log "8) 隔离验证:qc_exception 看不到"
# vp-mfg 启动 qc_exception
V_TOKEN=$(get_token "vp-mfg" "Pass1234!")
QC_BK="worker-leader-qc-$(date +%s)"
start_workflow "$V_TOKEN" "qc_exception_v1" "$QC_BK" \
  '{"businessType":"incident","severity":"low"}' >/dev/null
sleep 1
QC_ACT=$(get_active_task_json "$TOKEN" "${TEST_PREFIX}-$QC_BK")
echo "$QC_ACT" | python3 -c '
import json,sys
t = json.load(sys.stdin).get("task") or {}
groups = t.get("candidateGroups") or []
print("  qc isolate groups:", groups)
assert groups == ["quality"], f"应只有 quality 组, 实际 {groups}"
assert "approver" not in groups, "worker-leader 不应能办 qc"
print("  worker-leader.position=approver 不在 quality 组 ✓")
'

log "✅ 角色 worker-leader 通过"
