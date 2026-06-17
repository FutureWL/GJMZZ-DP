#!/usr/bin/env bash
# 角色 mgr-quality(孙经理 · 质量经理)— 端到端 API smoke
# position=quality_manager → qc_exception_v1 review 步骤可办
# simple_approval_v1 [approver,manager] 看不到

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=./common.sh
source "$SCRIPT_DIR/common.sh"

USER="mgr-quality"
PASS="Pass1234!"

log() { printf '[test-mgr-quality] %s\n' "$*"; }
fail() { printf '[test-mgr-quality] FAIL: %s\n' "$*" >&2; exit 1; }

# Flowable REST 基本认证
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
expect_contains "profile.position" "$PROFILE" '"position":"quality_manager"'
expect_contains "profile.name"     "$PROFILE" '"name":"孙经理"'
expect_contains "profile.dept"     "$PROFILE" '"department":"质量中心"'

log "3) 菜单(质量管控域)"
MENU=$(get_menu "$TOKEN")
N=$(count_json "$MENU")
log "  菜单条目数: $N"
[ "$N" -ge 40 ] || fail "菜单 < 40"
expect_contains "菜单-告警中心"     "$MENU" '"/quality/alerts"'
expect_contains "菜单-异常中心"     "$MENU" '"/quality/exceptions"'
expect_contains "菜单-检验任务"     "$MENU" '"/quality/inspections"'
expect_contains "菜单-设备监控"     "$MENU" '"/equipment/monitoring"'

log "4) 启动 qc_exception(用 vp-mfg token,因为我们只测 review 步骤)"
MGR_TOKEN=$(get_token "vp-mfg" "Pass1234!")
QC_BK="mgr-quality-qc-$(date +%s)"
QC_PROC=$(start_workflow "$MGR_TOKEN" "qc_exception_v1" "$QC_BK" \
  '{"businessType":"incident","severity":"high","factory":"F1"}')
[ -n "$QC_PROC" ] || fail "qc 启动失败"
log "  qc 流程实例: $QC_PROC (bk=$(last_bk))"

log "5) 用 Flowable REST 直接完成 isolate 步骤(quality 组无 seed 用户)"
sleep 1
ISO_ID=$(curl -sS -m 5 -u "$FAUTH" \
  "$FBASE/runtime/tasks?processInstanceId=$QC_PROC" \
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
if [ -z "$ISO_ID" ]; then
  fail "找不到 isolate 任务, 流程状态异常"
fi
log "  isolate task: $ISO_ID → complete"
curl -sS -m 5 -u "$FAUTH" -X POST "$FBASE/runtime/tasks/$ISO_ID" \
  -H "Content-Type: application/json" -d '{"action":"complete"}' >/dev/null
sleep 1

log "6) mgr-quality 拉待办 → 应有 review 任务"
TASKS=$(get_my_tasks "$TOKEN")
TC=$(count_json "$TASKS")
log "  待办数: $TC"
[ "$TC" -ge 1 ] || fail "mgr-quality 没看到 review 待办, 实际 $TC"
# 找到 review 任务
REVIEW_ID=$(echo "$TASKS" | python3 -c '
import json,sys
d=json.load(sys.stdin)
for t in d:
    if t.get("name") == "评审" or "review" in (t.get("name") or "").lower():
        print(t["id"]); break
else:
    print("")
')
[ -n "$REVIEW_ID" ] || fail "找不到 review 任务, 待办=$TASKS"
log "  review task: $REVIEW_ID"

log "7) 校验 active-task candidateGroups 包含 quality_manager"
ACT=$(get_active_task_json "$TOKEN" "${TEST_PREFIX}-$QC_BK")
echo "$ACT" | python3 -c '
import json,sys
t = json.load(sys.stdin).get("task") or {}
groups = t.get("candidateGroups") or []
print("  groups:", groups)
assert "quality_manager" in groups, "quality_manager 不在 candidateGroups"
print("  canAct: True (mgr-quality.position=quality_manager ∈ groups)")
'

log "8) mgr-quality 同意 review → 推进到 dispose"
RESULT=$(complete_task "$TOKEN" "$REVIEW_ID" "APPROVE" "quality review pass")
expect_contains "complete" "$RESULT" '"ok":true'
sleep 1

log "9) 隔离验证:simple_approval_v1 应看不到(quality_manager 不在 [approver,manager])"
SIM_BK="mgr-quality-sim-$(date +%s)"
start_simple_approval "$MGR_TOKEN" "$SIM_BK" "expense_claim" '"amountTotal":1000' >/dev/null
sleep 1
# 检查这个 BK 的 active-task,candidateGroups 应不含 quality_manager
SIM_ACT=$(get_active_task_json "$TOKEN" "${TEST_PREFIX}-$SIM_BK")
echo "$SIM_ACT" | python3 -c '
import json,sys
d = json.load(sys.stdin)
t = d.get("task") or {}
groups = t.get("candidateGroups") or []
print("  simple_approval groups:", groups)
assert "approver" in groups and "manager" in groups, "simple 应在 [approver,manager]"
assert "quality_manager" not in groups, "quality_manager 不应在 simple_approval groups"
print("  mgr-quality.position=quality_manager 不在 groups ✓")
'
# 清理:批掉这条 simple
SIM_TASKS=$(get_my_tasks "$TOKEN")
SIM_TASK_ID=$(echo "$SIM_TASKS" | python3 -c "
import json,sys
d=json.load(sys.stdin)
for t in d:
  if t.get('processInstanceId','').startswith('$(echo $SIM_BK | head -c 8)') or t.get('name')=='审批':
    print(t['id']); break
else:
  print('')
")
if [ -n "$SIM_TASK_ID" ]; then
  complete_task "$TOKEN" "$SIM_TASK_ID" "APPROVE" "clean" >/dev/null
fi

log "✅ 角色 mgr-quality 通过"
