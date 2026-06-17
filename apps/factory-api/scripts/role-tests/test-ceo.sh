#!/usr/bin/env bash
# 角色 ceo(总经理)— 端到端 API smoke
# 覆盖:登录 / 菜单 / 档案 / 待办 / 启动流程(模拟他人提交) / 完成任务

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=./common.sh
source "$SCRIPT_DIR/common.sh"

USER="ceo"
PASS="Pass1234!"

log() { printf '[test-ceo] %s\n' "$*"; }
fail() { printf '[test-ceo] FAIL: %s\n' "$*" >&2; exit 1; }


log "0) 隔离:清理所有 active 流程(preflight)"
reset_all_processes
log "1) 登录"
TOKEN=$(get_token "$USER" "$PASS")
[ -n "$TOKEN" ] || fail "未拿到 token"
log "  token len: ${#TOKEN}"

log "2) 看 profile"
PROFILE=$(get_profile "$TOKEN")
echo "$PROFILE" | python3 -m json.tool
expect_contains "profile" "$PROFILE" '"position":"approver"'
expect_contains "profile" "$PROFILE" '"name":"张总"'

log "3) 看菜单"
MENU=$(get_menu "$TOKEN")
log "  菜单条目数: $(count_json "$MENU")"
[ "$(count_json "$MENU")" -gt 40 ] || fail "菜单条数 < 40,实际 $(count_json "$MENU")"
# 检查关键菜单项(以 mock JSON 实际路径为准)
expect_contains "菜单-经营驾驶舱" "$MENU" '"/sales/business/dashboard"'
expect_contains "菜单-审批中心" "$MENU" '"/management/approval"'
expect_contains "菜单-工厂总览" "$MENU" '"/production/dashboards/factory"'
expect_contains "菜单-告警中心" "$MENU" '"/quality/alerts"'

log "4) 启动一个测试流程(模拟'营销副总'提交合同,让 ceo 看到待办)"
# 复用 vp-sales 用户的 token
SAL_TOKEN=$(get_token "vp-sales" "Pass1234!")
BK="ceo-test-$(date +%s)"
START=$(start_simple_approval "$SAL_TOKEN" "$BK" "contract_review" '"amountTotal":10000,"counterparty":"ACME"')
PROC_ID=$(echo "$START" | python3 -c 'import json,sys;print(json.load(sys.stdin).get("id",""))')
[ -n "$PROC_ID" ] || fail "启动失败: $START"
log "  流程实例: $PROC_ID (businessKey=$BK)"
sleep 1

log "5) 拉 ceo 的待办(应至少 1 条)"
TASKS=$(get_my_tasks "$TOKEN")
TASK_COUNT=$(count_json "$TASKS")
log "  待办数: $TASK_COUNT"
[ "$TASK_COUNT" -ge 1 ] || fail "ceo 没有待办,实际 $TASK_COUNT"
TASK_ID=$(echo "$TASKS" | python3 -c 'import json,sys;d=json.load(sys.stdin);print(d[0]["id"] if d else "")')
log "  任务 id: $TASK_ID"

log "6) 拉 active-task 看 candidateGroups"
ACT=$(curl -sS -m 5 "$API_BASE/workflow/process-instances/by-business-key/${TEST_PREFIX}-$BK/active-task" \
  -H "Authorization: Bearer $TOKEN")
echo "$ACT" | python3 -c '
import json,sys
d = json.load(sys.stdin)
t = d.get("task") or {}
print("  task name:", t.get("name"))
print("  candidateGroups:", t.get("candidateGroups"))
print("  canAct(ceo pos=approver in groups):", "approver" in (t.get("candidateGroups") or []))
'

log "7) ceo 审批(APPROVE)"
RESULT=$(complete_task "$TOKEN" "$TASK_ID" "APPROVE" "ceo smoke test")
log "  结果: $RESULT"
expect_contains "complete" "$RESULT" '"ok":true'

log "8) 验证流程已结束"
sleep 1
HIST=$(curl -sS -m 5 "$API_BASE/workflow/process-instances/$PROC_ID/history" -H "Authorization: Bearer $TOKEN")
expect_contains "history" "$HIST" '"approve_task"'

log "9) ceo 待办再次查询(应空)"
TASKS2=$(get_my_tasks "$TOKEN")
TASK_COUNT2=$(count_json "$TASKS2")
log "  剩余待办: $TASK_COUNT2"

log "✅ 角色 ceo 通过"
