#!/usr/bin/env bash
# 角色 inspector(褚检验员 · 质量检验员)— 端到端 API smoke ⭐
# position=quality → qc_exception_v1 isolate 步骤可办
# 关键:补齐 qc_exception 完整三步链(之前中层测试要跳过 isolate)

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=./common.sh
source "$SCRIPT_DIR/common.sh"

USER="inspector"
PASS="Pass1234!"

log() { printf '[test-inspector] %s\n' "$*"; }
fail() { printf '[test-inspector] FAIL: %s\n' "$*" >&2; exit 1; }


log "0) 隔离:清理所有 active 流程(preflight)"
reset_all_processes
log "1) 登录"
TOKEN=$(get_token "$USER" "$PASS")
[ -n "$TOKEN" ] || fail "未拿到 token"

log "2) profile 校验"
PROFILE=$(get_profile "$TOKEN")
expect_contains "profile.position" "$PROFILE" '"position":"quality"'
expect_contains "profile.name"     "$PROFILE" '"name":"褚检验员"'
expect_contains "profile.dept"     "$PROFILE" '"department":"质量中心"'

log "3) 菜单(质量管控)"
MENU=$(get_menu "$TOKEN")
N=$(count_json "$MENU")
[ "$N" -ge 40 ] || fail "菜单 < 40"
expect_contains "菜单-告警中心" "$MENU" '"/quality/alerts"'
expect_contains "菜单-异常中心" "$MENU" '"/quality/exceptions"'
expect_contains "菜单-检验任务" "$MENU" '"/quality/inspections"'

log "4) 启动 qc_exception(用 vp-mfg token)"
MGR_TOKEN=$(get_token "vp-mfg" "Pass1234!")
QC_BK="inspector-qc-$(date +%s)"
QC_PROC=$(start_workflow "$MGR_TOKEN" "qc_exception_v1" "$QC_BK" \
  '{"businessType":"incident","severity":"high","factory":"F1"}')
[ -n "$QC_PROC" ] || fail "qc 启动失败"
log "  qc 流程: $QC_PROC (bk=$(last_bk))"
sleep 1

log "5) inspector 拉待办 → 应有 isolate 任务 ⭐"
TASKS=$(get_my_tasks "$TOKEN")
TC=$(count_json "$TASKS")
log "  待办数: $TC"
[ "$TC" -ge 1 ] || fail "inspector 应看到 isolate 待办, 实际 $TC"
# 找本次 bk 对应的 isolate(用 active-task)
ACT=$(curl -sS -m 5 "$API_BASE/workflow/process-instances/by-business-key/$(last_bk)/active-task" \
  -H "Authorization: Bearer $TOKEN")
ISO_ID=$(echo "$ACT" | python3 -c '
import json,sys
t = json.load(sys.stdin).get("task") or {}
print(t.get("id","") if t.get("name") in ("隔离","isolate") else "")
')
[ -n "$ISO_ID" ] || fail "找不到本次 qc 的 isolate 任务"
log "  isolate task: $ISO_ID"

log "6) 校验 active-task candidateGroups=[quality]"
ACT=$(get_active_task_json "$TOKEN" "${TEST_PREFIX}-$QC_BK")
echo "$ACT" | python3 -c '
import json,sys
t = json.load(sys.stdin).get("task") or {}
groups = t.get("candidateGroups") or []
print("  groups:", groups)
assert groups == ["quality"], f"应只有 quality 组, 实际 {groups}"
print("  canAct(isolate): True (inspector.position=quality)")
'

log "7) inspector 同意 isolate → 推进到 review"
RESULT=$(complete_task "$TOKEN" "$ISO_ID" "APPROVE" "inspector isolate")
expect_contains "complete isolate" "$RESULT" '"ok":true'
sleep 1

log "8) 拉新待办(针对本次 qc bk, 应已无 isolate; review/dispose 都不归 inspector)"
# 看本次 bk 的 active-task, isolate 已办完, 应是 review(dispose 也可能)
ACT2=$(get_active_task_json "$TOKEN" "${TEST_PREFIX}-$QC_BK")
echo "$ACT2" | python3 -c '
import json,sys
d = json.load(sys.stdin)
t = d.get("task") or {}
name = t.get("name") or ""
groups = t.get("candidateGroups") or []
print("  next active task name:", name, "groups:", groups)
assert name != "隔离" and "quality" not in groups, f"inspector 不应还有 isolate/quality 任务, 实际 name={name} groups={groups}"
print("  isolate 已推进,inspector 在此流程中已无任务 ✓")
'

log "9) 隔离验证:simple_approval 看不到"
SIM_BK="inspector-sim-$(date +%s)"
start_simple_approval "$MGR_TOKEN" "$SIM_BK" "expense_claim" '"amountTotal":100' >/dev/null
sleep 1
SIM_ACT=$(get_active_task_json "$TOKEN" "${TEST_PREFIX}-$SIM_BK")
echo "$SIM_ACT" | python3 -c '
import json,sys
t = json.load(sys.stdin).get("task") or {}
groups = t.get("candidateGroups") or []
print("  simple groups:", groups)
assert "approver" in groups and "manager" in groups
assert "quality" not in groups
print("  inspector.position=quality 不在 [approver,manager] ✓")
'
# 清理 simple(用任意 approver 批掉)
ANY_TOKEN=$(get_token "ceo" "Pass1234!")
ANY_TASKS=$(get_my_tasks "$ANY_TOKEN" | python3 -c '
import json,sys
d=json.load(sys.stdin)
# 找 businessKey 对应的 task(processInstanceId 不易获取,直接找最新审批)
for t in d:
    if t.get("name") == "审批":
        print(t["id"]); break
else:
    print("")
')
if [ -n "$ANY_TASKS" ]; then
  complete_task "$ANY_TOKEN" "$ANY_TASKS" "APPROVE" "clean" >/dev/null
fi

log "10) 全流程收尾:让 mgr-quality 办 review + tech 办 dispose,流程结束"
Q_TOKEN=$(get_token "mgr-quality" "Pass1234!")
sleep 1
Q_TASKS=$(get_my_tasks "$Q_TOKEN")
REVIEW_ID=$(echo "$Q_TASKS" | python3 -c '
import json,sys
d=json.load(sys.stdin)
for t in d:
    if t.get("name") in ("评审", "review"):
        print(t["id"]); break
else:
    print("")
')
[ -n "$REVIEW_ID" ] || fail "mgr-quality 应看到 review 待办"
complete_task "$Q_TOKEN" "$REVIEW_ID" "APPROVE" "review pass" >/dev/null
log "  review 已办"

T_TOKEN=$(get_token "tech" "Pass1234!")
sleep 1
T_TASKS=$(get_my_tasks "$T_TOKEN")
DISP_ID=$(echo "$T_TASKS" | python3 -c '
import json,sys
d=json.load(sys.stdin)
for t in d:
    if t.get("name") in ("处置", "dispose"):
        print(t["id"]); break
else:
    print("")
')
[ -n "$DISP_ID" ] || fail "tech 应看到 dispose 待办"
complete_task "$T_TOKEN" "$DISP_ID" "APPROVE" "dispose pass" >/dev/null
log "  dispose 已办 → qc 流程结束"

log "✅ 角色 inspector 通过(qc_exception 完整三步链跑通)"
