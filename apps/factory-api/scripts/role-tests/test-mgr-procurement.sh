#!/usr/bin/env bash
# 角色 mgr-procurement(周经理 · 采购经理)— 端到端 API smoke
# position=approver → simple_approval_v1 可办
# 业务侧重:采购与供应链菜单

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=./common.sh
source "$SCRIPT_DIR/common.sh"

USER="mgr-procurement"
PASS="Pass1234!"

log() { printf '[test-mgr-procurement] %s\n' "$*"; }
fail() { printf '[test-mgr-procurement] FAIL: %s\n' "$*" >&2; exit 1; }


log "0) 隔离:清理所有 active 流程(preflight)"
reset_all_processes
log "1) 登录"
TOKEN=$(get_token "$USER" "$PASS")
[ -n "$TOKEN" ] || fail "未拿到 token"

log "2) profile 校验"
PROFILE=$(get_profile "$TOKEN")
expect_contains "profile.position" "$PROFILE" '"position":"approver"'
expect_contains "profile.name"     "$PROFILE" '"name":"周经理"'
expect_contains "profile.dept"     "$PROFILE" '"department":"采购中心"'

log "3) 菜单(采购域)"
MENU=$(get_menu "$TOKEN")
N=$(count_json "$MENU")
log "  菜单条目数: $N"
[ "$N" -ge 40 ] || fail "菜单 < 40"
expect_contains "菜单-供应商管理"  "$MENU" '"/supply/suppliers/list"'
expect_contains "菜单-采购申请"    "$MENU" '"/supply/procurement/orders"'
expect_contains "菜单-询价"        "$MENU" '"/supply/suppliers/contracts"'
expect_contains "菜单-招投标"      "$MENU" '"/supply/suppliers/outsourcing"'

log "4) 提交 PR 自审自批"
BK="mgr-procurement-pr-$(date +%s)"
START=$(start_simple_approval "$TOKEN" "$BK" "purchase_pr" '"amountTotal":20000,"supplier":"上海钢联","material":"Q235B","quantity":100')
PROC_ID=$(echo "$START" | python3 -c 'import json,sys;print(json.load(sys.stdin).get("id",""))')
[ -n "$PROC_ID" ] || fail "启动失败"
log "  PR 流程: $PROC_ID"
sleep 1

log "5) 拉自己的待办"
TASKS=$(get_my_tasks "$TOKEN")
TC=$(count_json "$TASKS")
log "  待办数: $TC"
[ "$TC" -ge 1 ] || fail "mgr-procurement 没有待办"
TASK_ID=$(echo "$TASKS" | python3 -c 'import json,sys;print(json.load(sys.stdin)[0]["id"])')

log "6) 校验 candidateGroups 包含 approver"
ACT=$(curl -sS -m 5 "$API_BASE/workflow/process-instances/by-business-key/${TEST_PREFIX}-$BK/active-task" \
  -H "Authorization: Bearer $TOKEN")
echo "$ACT" | python3 -c '
import json,sys
t = json.load(sys.stdin).get("task") or {}
groups = t.get("candidateGroups") or []
print("  groups:", groups)
assert "approver" in groups, "approver 不在 candidateGroups"
print("  canAct: True")
'

log "7) 同意 → 流程结束"
RESULT=$(complete_task "$TOKEN" "$TASK_ID" "APPROVE" "procurement self approve")
expect_contains "complete" "$RESULT" '"ok":true'
sleep 1

log "8) 跨用户协作:vp-finance 启动, mgr-procurement 看到"
V_TOKEN=$(get_token "vp-finance" "Pass1234!")
X_BK="mgr-procurement-cross-$(date +%s)"
X_START=$(start_simple_approval "$V_TOKEN" "$X_BK" "expense_claim" '"amountTotal":5000')
[ -n "$X_START" ] || fail "跨用户流程启动失败"
sleep 1
X_TASKS=$(get_my_tasks "$TOKEN")
X_TC=$(count_json "$X_TASKS")
log "  mgr-procurement 看到 vp-finance 启动的待办: $X_TC (期望 ≥1)"
[ "$X_TC" -ge 1 ] || fail "跨用户协作失败, 实际 $X_TC"

log "9) 清理:批掉这条"
X_TASK_ID=$(echo "$X_TASKS" | python3 -c 'import json,sys;print(json.load(sys.stdin)[0]["id"])')
complete_task "$TOKEN" "$X_TASK_ID" "APPROVE" "cross user" >/dev/null

log "✅ 角色 mgr-procurement 通过"
