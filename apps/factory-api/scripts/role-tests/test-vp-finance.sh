#!/usr/bin/env bash
# 角色 vp-finance(财务/风控负责人)— 端到端 API smoke
# 覆盖:登录 / 档案 / 菜单 / 提交费用报销 / 提交采购 PR / 待办 / 审批

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=./common.sh
source "$SCRIPT_DIR/common.sh"

USER="vp-finance"
PASS="Pass1234!"

log() { printf '[test-vp-finance] %s\n' "$*"; }
fail() { printf '[test-vp-finance] FAIL: %s\n' "$*" >&2; exit 1; }


log "0) 隔离:清理所有 active 流程(preflight)"
reset_all_processes
log "1) 登录"
TOKEN=$(get_token "$USER" "$PASS")
[ -n "$TOKEN" ] || fail "未拿到 token"

log "2) profile"
PROFILE=$(get_profile "$TOKEN")
expect_contains "profile" "$PROFILE" '"name":"陈总监"'
expect_contains "profile" "$PROFILE" '"department":"财务中心"'

log "3) 菜单(应见费用/财务/审批入口)"
MENU=$(get_menu "$TOKEN")
expect_contains "菜单-费用报销" "$MENU" '"/management/erp/expenses"'
expect_contains "菜单-审批中心" "$MENU" '"/management/approval"'
expect_contains "菜单-通知中心" "$MENU" '"/management/notifications"'
expect_contains "菜单-审计日志" "$MENU" '"/management/audit/log"'

log "4) 财务/风控 — 默认落地页是审批中心"
# 这一条在 UI 实现上由侧边栏自动高亮,API 测只验菜单项可见

log "5) 提交费用报销"
BK1="fin-expense-$(date +%s)"
START1=$(start_simple_approval "$TOKEN" "$BK1" "expense_claim" '"amountTotal":8888.50,"claimType":"差旅"')
PROC1=$(echo "$START1" | python3 -c 'import json,sys;print(json.load(sys.stdin).get("id",""))')
[ -n "$PROC1" ] || fail "费用流程启动失败"
log "  报销流程: $PROC1"

log "6) 提交采购 PR"
BK2="fin-pr-$(date +%s)"
START2=$(start_simple_approval "$TOKEN" "$BK2" "procurement_pr" '"amountTotal":50000,"departmentId":"DEPT-FIN"')
PROC2=$(echo "$START2" | python3 -c 'import json,sys;print(json.load(sys.stdin).get("id",""))')
[ -n "$PROC2" ] || fail "PR 流程启动失败"
log "  PR 流程: $PROC2"

sleep 1

log "7) 待办(应含自己提交的 2 条 + 历史)"
TASKS=$(get_my_tasks "$TOKEN")
TASK_COUNT=$(count_json "$TASKS")
log "  待办数: $TASK_COUNT"
[ "$TASK_COUNT" -ge 2 ] || fail "vp-finance 待办应 >= 2(费用 + PR),实际 $TASK_COUNT"
# 看是否包含两个新流程
BOTH=$(echo "$TASKS" | python3 -c "
import json,sys
d = json.load(sys.stdin)
ids = {t.get('processInstanceId') for t in d}
print('yes' if '$PROC1' in ids and '$PROC2' in ids else 'no')
")
[ "$BOTH" = "yes" ] || fail "vp-finance 待办中未找到两个新流程的 task"

log "8) 财务/风控完成两个 task(自审自批)"
T1=$(echo "$TASKS" | python3 -c "
import json,sys
d = json.load(sys.stdin)
for t in d:
    if t.get('processInstanceId') == '$PROC1':
        print(t['id']); break
")
T2=$(echo "$TASKS" | python3 -c "
import json,sys
d = json.load(sys.stdin)
for t in d:
    if t.get('processInstanceId') == '$PROC2':
        print(t['id']); break
")
[ -n "$T1" ] && [ -n "$T2" ] || fail "未找到 T1 或 T2"
complete_task "$TOKEN" "$T1" "APPROVE" "finance approve expense" >/dev/null
complete_task "$TOKEN" "$T2" "APPROVE" "finance approve pr" >/dev/null
log "  ✅ 两个 task 完成"

log "9) 验证流程已结束"
sleep 1
HIST1=$(curl -sS -m 5 "$API_BASE/workflow/process-instances/$PROC1/history" -H "Authorization: Bearer $TOKEN")
expect_contains "hist1" "$HIST1" '"approve_task"'

log "✅ 角色 vp-finance 通过"
