#!/usr/bin/env bash
# 角色 ceo-deputy(常务副总经理)— 端到端 API smoke
# 覆盖:登录 / 档案 / 菜单 / 待办 / 审批
# 与 ceo 路径一致(共用 approver)

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=./common.sh
source "$SCRIPT_DIR/common.sh"

USER="ceo-deputy"
PASS="Pass1234!"

log() { printf '[test-ceo-deputy] %s\n' "$*"; }
fail() { printf '[test-ceo-deputy] FAIL: %s\n' "$*" >&2; exit 1; }


log "0) 隔离:清理所有 active 流程(preflight)"
reset_all_processes
log "1) 登录"
TOKEN=$(get_token "$USER" "$PASS")
[ -n "$TOKEN" ] || fail "未拿到 token"
log "  token len: ${#TOKEN}"

log "2) profile"
PROFILE=$(get_profile "$TOKEN")
expect_contains "profile" "$PROFILE" '"position":"approver"'
expect_contains "profile" "$PROFILE" '"name":"李副总"'
expect_contains "profile" "$PROFILE" '"department":"总经办"'

log "3) 菜单"
MENU=$(get_menu "$TOKEN")
[ "$(count_json "$MENU")" -gt 40 ] || fail "菜单 < 40"

log "4) 启动一个流程(ceo 提交)"
CEO_TOKEN=$(get_token "ceo" "Pass1234!")
BK="deputy-test-$(date +%s)"
START=$(start_simple_approval "$CEO_TOKEN" "$BK" "expense_claim" '"amountTotal":5000')
PROC_ID=$(echo "$START" | python3 -c 'import json,sys;print(json.load(sys.stdin).get("id",""))')
[ -n "$PROC_ID" ] || fail "启动失败"
log "  businessKey=$BK"

sleep 1

log "5) ceo-deputy 应能看到该待办"
TASKS=$(get_my_tasks "$TOKEN")
TASK_COUNT=$(count_json "$TASKS")
log "  待办数: $TASK_COUNT"
[ "$TASK_COUNT" -ge 1 ] || fail "ceo-deputy 没有待办"
# 找刚启动的那条
TARGET_ID=$(echo "$TASKS" | python3 -c "
import json,sys
d = json.load(sys.stdin)
for t in d:
    if t.get('processInstanceId') == '$PROC_ID':
        print(t['id']); break
")
[ -n "$TARGET_ID" ] || fail "未找到刚启动的流程 $PROC_ID 在 ceo-deputy 的待办中"
log "  目标 task: $TARGET_ID"

log "6) 验证 candidateGroups(approver/manager)"
ACT=$(curl -sS -m 5 "$API_BASE/workflow/process-instances/by-business-key/${TEST_PREFIX}-$BK/active-task" \
  -H "Authorization: Bearer $TOKEN")
echo "$ACT" | python3 -c '
import json,sys
d = json.load(sys.stdin)
t = d.get("task") or {}
print("  candidateGroups:", t.get("candidateGroups"))
'
expect_contains "candidateGroups" "$ACT" '"approver"'

log "7) ceo-deputy 审批"
RESULT=$(complete_task "$TOKEN" "$TARGET_ID" "APPROVE" "ceo-deputy smoke")
expect_contains "complete" "$RESULT" '"ok":true'

log "✅ 角色 ceo-deputy 通过"
