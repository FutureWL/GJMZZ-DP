#!/usr/bin/env bash
# 角色 planner(陈计划员 · 生产计划员)— 端到端 API smoke
# position=approver → simple_approval 可办

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=./common.sh
source "$SCRIPT_DIR/common.sh"

USER="planner"
PASS="Pass1234!"

log() { printf '[test-planner] %s\n' "$*"; }
fail() { printf '[test-planner] FAIL: %s\n' "$*" >&2; exit 1; }


log "0) 隔离:清理所有 active 流程(preflight)"
reset_all_processes
log "1) 登录"
TOKEN=$(get_token "$USER" "$PASS")
[ -n "$TOKEN" ] || fail "未拿到 token"

log "2) profile 校验"
PROFILE=$(get_profile "$TOKEN")
expect_contains "profile.position" "$PROFILE" '"position":"approver"'
expect_contains "profile.name"     "$PROFILE" '"name":"陈计划员"'
expect_contains "profile.dept"     "$PROFILE" '"department":"生产计划部"'

log "3) 菜单(排程/工单/计划)"
MENU=$(get_menu "$TOKEN")
N=$(count_json "$MENU")
[ "$N" -ge 40 ] || fail "菜单 < 40"
expect_contains "菜单-排程"     "$MENU" '"/production/execution/scheduling"'
expect_contains "菜单-工单"     "$MENU" '"/production/execution/workorders"'
expect_contains "菜单-工厂总览" "$MENU" '"/production/dashboards/factory"'

log "4) simple_approval 自审自批(排程变更申请)"
BK="planner-test-$(date +%s)"
START=$(start_simple_approval "$TOKEN" "$BK" "schedule_change" '"amountTotal":0,"line":"L1","changeType":"add_shift"')
PROC_ID=$(echo "$START" | python3 -c 'import json,sys;print(json.load(sys.stdin).get("id",""))')
[ -n "$PROC_ID" ] || fail "启动失败"
sleep 1

log "5) 拉待办 + 同意"
TASKS=$(get_my_tasks "$TOKEN")
[ "$(count_json "$TASKS")" -ge 1 ] || fail "无待办"
TASK_ID=$(echo "$TASKS" | python3 -c 'import json,sys;print(json.load(sys.stdin)[0]["id"])')
ACT=$(curl -sS -m 5 "$API_BASE/workflow/process-instances/by-business-key/${TEST_PREFIX}-$BK/active-task" \
  -H "Authorization: Bearer $TOKEN")
echo "$ACT" | python3 -c '
import json,sys
t = json.load(sys.stdin).get("task") or {}
assert "approver" in (t.get("candidateGroups") or [])
print("  canAct(simple): True")
'
RESULT=$(complete_task "$TOKEN" "$TASK_ID" "APPROVE" "planner self approve")
expect_contains "complete" "$RESULT" '"ok":true'

log "✅ 角色 planner 通过"
