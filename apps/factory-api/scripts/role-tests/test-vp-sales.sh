#!/usr/bin/env bash
# 角色 vp-sales(营销副总)— 端到端 API smoke
# 覆盖:登录 / 档案 / 菜单 / 提交合同(自审自批演示)

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=./common.sh
source "$SCRIPT_DIR/common.sh"

USER="vp-sales"
PASS="Pass1234!"

log() { printf '[test-vp-sales] %s\n' "$*"; }
fail() { printf '[test-vp-sales] FAIL: %s\n' "$*" >&2; exit 1; }


log "0) 隔离:清理所有 active 流程(preflight)"
reset_all_processes
log "1) 登录"
TOKEN=$(get_token "$USER" "$PASS")
[ -n "$TOKEN" ] || fail "未拿到 token"

log "2) profile"
PROFILE=$(get_profile "$TOKEN")
expect_contains "profile" "$PROFILE" '"name":"王副总"'
expect_contains "profile" "$PROFILE" '"department":"营销中心"'

log "3) 菜单(应有 CRM 入口)"
MENU=$(get_menu "$TOKEN")
expect_contains "菜单-客户" "$MENU" '"/sales/crm/customers"'
expect_contains "菜单-机会" "$MENU" '"/sales/business/opportunities"'
expect_contains "菜单-报价" "$MENU" '"/sales/business/quotes"'
expect_contains "菜单-合同评审" "$MENU" '"/supply/suppliers/contracts"'

log "4) 营销副总提交合同评审(自审自批演示)"
BK="sales-contract-$(date +%s)"
START=$(start_simple_approval "$TOKEN" "$BK" "contract_review" '"amountTotal":100000,"counterparty":"ACME Inc.","riskLevel":"medium"')
PROC_ID=$(echo "$START" | python3 -c 'import json,sys;print(json.load(sys.stdin).get("id",""))')
[ -n "$PROC_ID" ] || fail "启动失败"
log "  流程: $PROC_ID"

sleep 1

log "5) active-task 验证(自己提交,自己也应该看到待办)"
ACT=$(curl -sS -m 5 "$API_BASE/workflow/process-instances/by-business-key/${TEST_PREFIX}-$BK/active-task" \
  -H "Authorization: Bearer $TOKEN")
echo "$ACT" | python3 -c '
import json,sys
d = json.load(sys.stdin)
t = d.get("task") or {}
print("  task name:", t.get("name"))
print("  candidateGroups:", t.get("candidateGroups"))
print("  processInstance.startUserId:", (d.get("processInstance") or {}).get("startUserId"))
'
expect_contains "candidateGroups" "$ACT" '"approver"'

log "6) 自审自批"
TASKS=$(get_my_tasks "$TOKEN")
TASK_ID=$(echo "$TASKS" | python3 -c "
import json,sys
d = json.load(sys.stdin)
for t in d:
    if t.get('processInstanceId') == '$PROC_ID':
        print(t['id']); break
")
[ -n "$TASK_ID" ] || fail "未在 vp-sales 待办中找到刚启动的流程"
RESULT=$(complete_task "$TOKEN" "$TASK_ID" "APPROVE" "vp-sales self-approve")
expect_contains "complete" "$RESULT" '"ok":true'

log "✅ 角色 vp-sales 通过"
