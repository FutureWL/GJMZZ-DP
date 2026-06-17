#!/usr/bin/env bash
# 角色 tech(卫维修 · 设备维修)— 端到端 API smoke
# position=plant_manager → qc_exception review + dispose 可办

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=./common.sh
source "$SCRIPT_DIR/common.sh"

FUSER="${FLOWABLE_REST_USER:-rest-admin}"
FPASS="${FLOWABLE_REST_PASSWORD:-test}"
FAUTH="$FUSER:$FPASS"
FBASE="${FLOWABLE_REST_BASE_URL:-http://localhost:33725/flowable-rest/service}"

USER="tech"
PASS="Pass1234!"

log() { printf '[test-tech] %s\n' "$*"; }
fail() { printf '[test-tech] FAIL: %s\n' "$*" >&2; exit 1; }

log "0) 隔离:清理所有 active 流程(preflight)"
reset_all_processes

log "1) 登录"
TOKEN=$(get_token "$USER" "$PASS")
[ -n "$TOKEN" ] || fail "未拿到 token"

log "2) profile 校验"
PROFILE=$(get_profile "$TOKEN")
expect_contains "profile.position" "$PROFILE" '"position":"plant_manager"'
expect_contains "profile.name"     "$PROFILE" '"name":"卫维修"'
expect_contains "profile.dept"     "$PROFILE" '"department":"设备中心"'

log "3) 菜单(设备运维)"
MENU=$(get_menu "$TOKEN")
N=$(count_json "$MENU")
log "  菜单条目数: $N"
[ "$N" -ge 20 ] || fail "菜单 < 20"
expect_contains "菜单-设备监控"   "$MENU" '"/equipment/monitoring"'
expect_contains "菜单-维修工单"   "$MENU" '"/equipment/workorders"'
expect_contains "菜单-维修看板"   "$MENU" '"/equipment/dashboard"'

log "4) 启动 qc_exception(完整三步链)"
INS_TOKEN=$(get_token "inspector" "Pass1234!")
V_TOKEN=$(get_token "vp-mfg" "Pass1234!")
QC_BK="tech-qc-$(date +%s)"
QC_PROC=$(start_workflow "$V_TOKEN" "qc_exception_v1" "$QC_BK" \
  '{"businessType":"incident","severity":"medium","factory":"F2"}')
[ -n "$QC_PROC" ] || fail "qc 启动失败"
log "  qc 流程: $QC_PROC (bk=${TEST_PREFIX}-$QC_BK)"

# 等 isolate,用 Flowable REST 找
sleep 2
ISO_ID=$(curl -sS -m 5 -u "$FAUTH" "$FBASE/runtime/tasks?processInstanceId=$QC_PROC" \
  | python3 -c '
import json,sys
d=json.load(sys.stdin).get("data",[])
for t in d:
    if t.get("processInstanceId")=="'"$QC_PROC"'":
        print(t["id"]); break
else:
    print("")
')
[ -n "$ISO_ID" ] || fail "Flowable REST 找不到 isolate"
complete_task "$INS_TOKEN" "$ISO_ID" "APPROVE" "isolate" >/dev/null
log "  inspector 已办 isolate"

log "5) tech 拉 review 任务(用 active-task by bk)"
sleep 1
ACT=$(get_active_task_json "$TOKEN" "${TEST_PREFIX}-$QC_BK")
# 存 ACT 供后续步骤用,同时解析
echo "$ACT" > /tmp/tech_act.json
REVIEW_ID=$(python3 -c "
import json
t = json.load(open('/tmp/tech_act.json')).get('task') or {}
print(t.get('id','') if t.get('name') in ('评审','review') else '')
")
[ -n "$REVIEW_ID" ] || fail "找不到 review 任务, ACT=$(cat /tmp/tech_act.json | head -c 300)"
log "  review task: $REVIEW_ID"

log "6) 校验 candidateGroups(从 step5 缓存的 ACT 读)"
python3 -c "
import json
t = json.load(open('/tmp/tech_act.json')).get('task') or {}
groups = t.get('candidateGroups') or []
print('  groups:', groups)
assert 'plant_manager' in groups, f'plant_manager 不在 {groups}'
print('  canAct(review): True (tech.position=plant_manager)')
"

log "7) 同意 review → 推进到 dispose"
RESULT=$(complete_task "$TOKEN" "$REVIEW_ID" "APPROVE" "tech review pass")
expect_contains "complete review" "$RESULT" '"ok":true'
sleep 2

log "8) 拉 dispose 任务(用 active-task)"
ACT2=$(get_active_task_json "$TOKEN" "${TEST_PREFIX}-$QC_BK")
echo "$ACT2" > /tmp/tech_act2.json
DISP_ID=$(python3 -c "
import json
t = json.load(open('/tmp/tech_act2.json')).get('task') or {}
print(t.get('id','') if t.get('name') in ('处置','dispose') else '')
")
[ -n "$DISP_ID" ] || fail "找不到 dispose 任务"
log "  dispose task: $DISP_ID"

log "9) 同意 dispose → 流程结束"
RESULT2=$(complete_task "$TOKEN" "$DISP_ID" "APPROVE" "tech dispose pass")
expect_contains "complete dispose" "$RESULT2" '"ok":true'
sleep 3
HIST=$(curl -sS -m 5 "$API_BASE/workflow/process-instances/$QC_PROC/history" -H "Authorization: Bearer $TOKEN")
expect_contains "history isolate" "$HIST" '"isolate"'
expect_contains "history review"  "$HIST" '"review"'
expect_contains "history dispose" "$HIST" '"dispose"'

log "10) 隔离验证:simple_approval 看不到(plant_manager 不在 [approver,manager])"
SIM_BK="tech-sim-$(date +%s)"
start_simple_approval "$V_TOKEN" "$SIM_BK" "expense_claim" '"amountTotal":500' >/dev/null
sleep 1
SIM_ACT=$(get_active_task_json "$TOKEN" "${TEST_PREFIX}-$SIM_BK")
echo "$SIM_ACT" | python3 -c "
import json,sys
t = json.load(sys.stdin).get('task') or {}
groups = t.get('candidateGroups') or []
print('  simple groups:', groups)
assert 'approver' in groups and 'manager' in groups
assert 'plant_manager' not in groups
print('  tech.position=plant_manager 不在 [approver,manager] ✓')
"
# 清理
ANY_TOKEN=$(get_token "ceo" "Pass1234!")
ANY_TASK_ID=$(get_my_tasks "$ANY_TOKEN" | python3 -c "
import json,sys
d=json.load(sys.stdin)
for t in d:
    if t.get('name') == '审批':
        print(t['id']); break
else:
    print('')
")
[ -n "$ANY_TASK_ID" ] && complete_task "$ANY_TOKEN" "$ANY_TASK_ID" "APPROVE" "clean" >/dev/null

log "✅ 角色 tech 通过(qc_exception 三步链走完)"
