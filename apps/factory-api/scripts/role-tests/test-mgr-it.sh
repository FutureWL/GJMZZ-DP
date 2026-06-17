#!/usr/bin/env bash
# 角色 mgr-it(郑经理 · IT 经理)— 端到端 API smoke
# position=approver → simple_approval_v1 可办(同 ceo/vp-finance/mgr-procurement)

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=./common.sh
source "$SCRIPT_DIR/common.sh"

USER="mgr-it"
PASS="Pass1234!"

log() { printf '[test-mgr-it] %s\n' "$*"; }
fail() { printf '[test-mgr-it] FAIL: %s\n' "$*" >&2; exit 1; }


log "0) 隔离:清理所有 active 流程(preflight)"
reset_all_processes
log "1) 登录"
TOKEN=$(get_token "$USER" "$PASS")
[ -n "$TOKEN" ] || fail "未拿到 token"

log "2) profile 校验"
PROFILE=$(get_profile "$TOKEN")
expect_contains "profile.position" "$PROFILE" '"position":"approver"'
expect_contains "profile.name"     "$PROFILE" '"name":"郑经理"'
expect_contains "profile.dept"     "$PROFILE" '"department":"信息中心"'

log "3) 菜单(综合管理域 + IT 域)"
MENU=$(get_menu "$TOKEN")
N=$(count_json "$MENU")
log "  菜单条目数: $N"
[ "$N" -ge 40 ] || fail "菜单 < 40"
expect_contains "菜单-审批中心" "$MENU" '"/management/approval"'
expect_contains "菜单-审计日志" "$MENU" '"/management/audit/log"'
expect_contains "菜单-权限矩阵" "$MENU" '"/management/security/permissions"'

log "4) 提交 IT 资产采购单自审自批"
BK="mgr-it-test-$(date +%s)"
START=$(start_simple_approval "$TOKEN" "$BK" "it_asset_purchase" '"amountTotal":50000,"item":"服务器","qty":2')
PROC_ID=$(echo "$START" | python3 -c 'import json,sys;print(json.load(sys.stdin).get("id",""))')
[ -n "$PROC_ID" ] || fail "启动失败"
log "  流程: $PROC_ID"
sleep 1

log "5) 拉待办"
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
assert "approver" in groups, "approver 不在 groups"
print("  canAct: True")
'

log "7) 同意 → 流程结束"
RESULT=$(complete_task "$TOKEN" "$TASK_ID" "APPROVE" "it self approve")
expect_contains "complete" "$RESULT" '"ok":true'
sleep 1

log "8) 跨用户协作:ceode-puty 启动, mgr-it 看到"
C_TOKEN=$(get_token "ceo-deputy" "Pass1234!")
X_BK="mgr-it-cross-$(date +%s)"
start_simple_approval "$C_TOKEN" "$X_BK" "expense_claim" '"amountTotal":2000' >/dev/null
sleep 1
X_TASKS=$(get_my_tasks "$TOKEN")
X_TC=$(count_json "$X_TASKS")
log "  mgr-it 看到 ceode-puty 启动的待办: $X_TC (期望 ≥1, 同 approver 组)"
[ "$X_TC" -ge 1 ] || fail "跨用户协作失败"
# 清理
X_TASK_ID=$(echo "$X_TASKS" | python3 -c 'import json,sys;print(json.load(sys.stdin)[0]["id"])')
complete_task "$TOKEN" "$X_TASK_ID" "APPROVE" "cross clean" >/dev/null

log "✅ 角色 mgr-it 通过"
