#!/usr/bin/env bash
# 角色 mgr-equipment(吴经理 · 设备经理)— 端到端 API smoke
# position=plant_manager → qc_exception_v1 review + dispose 可办

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=./common.sh
source "$SCRIPT_DIR/common.sh"

USER="mgr-equipment"
PASS="Pass1234!"

log() { printf '[test-mgr-equipment] %s\n' "$*"; }
fail() { printf '[test-mgr-equipment] FAIL: %s\n' "$*" >&2; exit 1; }

FUSER="${FLOWABLE_REST_USER:-rest-admin}"
FPASS="${FLOWABLE_REST_PASSWORD:-test}"
FAUTH="$FUSER:$FPASS"
FBASE="${FLOWABLE_REST_BASE_URL:-http://localhost:33725/flowable-rest/service}"


log "0) 隔离:清理所有 active 流程(preflight)"
reset_all_processes
log "1) 登录"
TOKEN=$(get_token "$USER" "$PASS")
[ -n "$TOKEN" ] || fail "未拿到 token"

log "2) profile 校验"
PROFILE=$(get_profile "$TOKEN")
expect_contains "profile.position" "$PROFILE" '"position":"plant_manager"'
expect_contains "profile.name"     "$PROFILE" '"name":"吴经理"'
expect_contains "profile.dept"     "$PROFILE" '"department":"设备中心"'

log "3) 菜单(设备运维域)"
MENU=$(get_menu "$TOKEN")
N=$(count_json "$MENU")
log "  菜单条目数: $N"
[ "$N" -ge 40 ] || fail "菜单 < 40"
expect_contains "菜单-设备监控"   "$MENU" '"/equipment/monitoring"'
expect_contains "菜单-维修工单"   "$MENU" '"/equipment/workorders"'
expect_contains "菜单-维修看板"   "$MENU" '"/equipment/dashboard"'

log "4) 启动 qc_exception"
MGR_TOKEN=$(get_token "vp-mfg" "Pass1234!")
QC_BK="mgr-equipment-qc-$(date +%s)"
QC_PROC=$(start_workflow "$MGR_TOKEN" "qc_exception_v1" "$QC_BK" \
  '{"businessType":"incident","severity":"medium","factory":"F2"}')
[ -n "$QC_PROC" ] || fail "qc 启动失败"
log "  qc 流程: $QC_PROC (bk=$(last_bk))"

log "5) Flowable REST 跳过 isolate(quality 组)"
sleep 1
ISO_ID=$(curl -sS -m 5 -u "$FAUTH" "$FBASE/runtime/tasks?processInstanceId=$QC_PROC" \
  | python3 -c '
import json,sys
d=sys.stdin.read().strip()
if not d: print(""); sys.exit(0)
try:
  arr=(json.loads(d) or {}).get("data",[])
  for t in arr:
    if t.get("processInstanceId") == "'"$QC_PROC"'":
      print(t["id"]); break
  else:
    print("")
except: print("")')
if [ -z "$ISO_ID" ]; then fail "找不到 isolate"; fi
curl -sS -m 5 -u "$FAUTH" -X POST "$FBASE/runtime/tasks/$ISO_ID" \
  -H "Content-Type: application/json" -d '{"action":"complete"}' >/dev/null
log "  isolate 已跳过"

log "6) mgr-equipment 拉待办 → 应有 review 任务"
TASKS=$(get_my_tasks "$TOKEN")
TC=$(count_json "$TASKS")
log "  待办数: $TC"
[ "$TC" -ge 1 ] || fail "mgr-equipment 看不到 review 待办"
REVIEW_ID=$(echo "$TASKS" | python3 -c '
import json,sys
d=json.load(sys.stdin)
for t in d:
    if t.get("name") in ("评审", "review"):
        print(t["id"]); break
else:
    print("")
')
[ -n "$REVIEW_ID" ] || fail "找不到 review"
log "  review task: $REVIEW_ID"

log "7) 校验 candidateGroups 包含 plant_manager"
ACT=$(get_active_task_json "$TOKEN" "${TEST_PREFIX}-$QC_BK")
echo "$ACT" | python3 -c '
import json,sys
t = json.load(sys.stdin).get("task") or {}
groups = t.get("candidateGroups") or []
print("  groups:", groups)
assert "plant_manager" in groups, "plant_manager 不在 groups"
print("  canAct(review): True")
'

log "8) 同意 review → 推进到 dispose"
RESULT=$(complete_task "$TOKEN" "$REVIEW_ID" "APPROVE" "equipment review pass")
expect_contains "complete" "$RESULT" '"ok":true'
sleep 1

log "9) 拉待办 → 应有 dispose 任务"
TASKS2=$(get_my_tasks "$TOKEN")
DISP_ID=$(echo "$TASKS2" | python3 -c '
import json,sys
d=json.load(sys.stdin)
for t in d:
    if t.get("name") in ("处置", "dispose"):
        print(t["id"]); break
else:
    print("")
')
[ -n "$DISP_ID" ] || fail "找不到 dispose 任务, 待办=$TASKS2"
log "  dispose task: $DISP_ID"

log "10) 同意 dispose → 流程结束"
RESULT2=$(complete_task "$TOKEN" "$DISP_ID" "APPROVE" "equipment dispose")
expect_contains "complete dispose" "$RESULT2" '"ok":true'
sleep 3
HIST=$(curl -sS -m 5 "$API_BASE/workflow/process-instances/$QC_PROC/history" -H "Authorization: Bearer $TOKEN")
expect_contains "history isolate" "$HIST" '"isolate"'
expect_contains "history review"  "$HIST" '"review"'
expect_contains "history dispose" "$HIST" '"dispose"'

log "11) 隔离验证:simple_approval 看不到(plant_manager 不在 [approver,manager])"
SIM_BK="mgr-equipment-sim-$(date +%s)"
start_simple_approval "$MGR_TOKEN" "$SIM_BK" "expense_claim" '"amountTotal":300' >/dev/null
sleep 1
SIM_ACT=$(get_active_task_json "$TOKEN" "${TEST_PREFIX}-$SIM_BK")
echo "$SIM_ACT" | python3 -c '
import json,sys
t = json.load(sys.stdin).get("task") or {}
groups = t.get("candidateGroups") or []
print("  simple groups:", groups)
assert "approver" in groups and "manager" in groups
assert "plant_manager" not in groups
print("  mgr-equipment.position=plant_manager 不在 groups ✓")
'
# 清理
SIM_TASKS=$(get_my_tasks "$TOKEN")
SIM_TASK_ID=$(echo "$SIM_TASKS" | python3 -c "
import json,sys
d=json.load(sys.stdin)
for t in d:
  if t.get('name')=='审批':
    print(t['id']); break
else:
  print('')
")
if [ -n "$SIM_TASK_ID" ]; then
  complete_task "$TOKEN" "$SIM_TASK_ID" "APPROVE" "clean" >/dev/null
fi

log "✅ 角色 mgr-equipment 通过"
