#!/usr/bin/env bash
# 角色 warehouse(蒋库管 · 仓库管理员)— 端到端 API smoke
# position=approver → simple_approval 可办

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=./common.sh
source "$SCRIPT_DIR/common.sh"

USER="warehouse"
PASS="Pass1234!"

log() { printf '[test-warehouse] %s\n' "$*"; }
fail() { printf '[test-warehouse] FAIL: %s\n' "$*" >&2; exit 1; }


log "0) 隔离:清理所有 active 流程(preflight)"
reset_all_processes
log "1) 登录"
TOKEN=$(get_token "$USER" "$PASS")
[ -n "$TOKEN" ] || fail "未拿到 token"

log "2) profile 校验"
PROFILE=$(get_profile "$TOKEN")
expect_contains "profile.position" "$PROFILE" '"position":"approver"'
expect_contains "profile.name"     "$PROFILE" '"name":"蒋库管"'
expect_contains "profile.dept"     "$PROFILE" '"department":"仓储中心"'

log "3) 菜单(采购/仓储)"
MENU=$(get_menu "$TOKEN")
N=$(count_json "$MENU")
[ "$N" -ge 40 ] || fail "菜单 < 40"
expect_contains "菜单-采购 PR/PO"   "$MENU" '"/supply/procurement/orders"'
expect_contains "菜单-供应商"       "$MENU" '"/supply/suppliers/list"'
expect_contains "菜单-经营驾驶舱"   "$MENU" '"/sales/business/dashboard"'

log "4) simple_approval 自审自批(入库申请)"
BK="warehouse-test-$(date +%s)"
START=$(start_simple_approval "$TOKEN" "$BK" "stock_in" '"amountTotal":8000,"warehouse":"W1","material":"Q235B","qty":50')
PROC_ID=$(echo "$START" | python3 -c 'import json,sys;print(json.load(sys.stdin).get("id",""))')
[ -n "$PROC_ID" ] || fail "启动失败"
sleep 1

log "5) 拉待办 + 同意"
TASKS=$(get_my_tasks "$TOKEN")
[ "$(count_json "$TASKS")" -ge 1 ] || fail "无待办"
TASK_ID=$(echo "$TASKS" | python3 -c 'import json,sys;print(json.load(sys.stdin)[0]["id"])')
RESULT=$(complete_task "$TOKEN" "$TASK_ID" "APPROVE" "warehouse self approve")
expect_contains "complete" "$RESULT" '"ok":true'

log "6) 跨用户协作:vp-finance 启动, warehouse 看到"
V_TOKEN=$(get_token "vp-finance" "Pass1234!")
X_BK="warehouse-cross-$(date +%s)"
start_simple_approval "$V_TOKEN" "$X_BK" "expense_claim" '"amountTotal":300' >/dev/null
sleep 1
X_TASKS=$(get_my_tasks "$TOKEN")
X_TC=$(count_json "$X_TASKS")
log "  warehouse 看到 vp-finance 启动的待办: $X_TC (期望 ≥1, 同 approver 组)"
[ "$X_TC" -ge 1 ] || fail "跨用户协作失败"
X_TASK_ID=$(echo "$X_TASKS" | python3 -c 'import json,sys;print(json.load(sys.stdin)[0]["id"])')
complete_task "$TOKEN" "$X_TASK_ID" "APPROVE" "cross" >/dev/null

log "✅ 角色 warehouse 通过"
