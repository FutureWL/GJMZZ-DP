#!/usr/bin/env bash
# 共享:高层角色的 API smoke 公共部分
# 用法:source <(cat common.sh); <角色测试逻辑>

set -euo pipefail

KC_URL="${KEYCLOAK_URL:-http://localhost:18080}"
REALM="${REALM:-factory-platform}"
CLIENT_ID="${CLIENT_ID:-dev-cli}"
API_BASE="${API_BASE:-http://localhost:33700/api}"

# Flowable REST(隔离机制要用)
FBASE="${FLOWABLE_REST_BASE_URL:-http://localhost:33725/flowable-rest/service}"
FUSER="${FLOWABLE_REST_USER:-rest-admin}"
FPASS="${FLOWABLE_REST_PASSWORD:-test}"

# 测试隔离:全局唯一前缀(按 PID + 纳秒时间),所有 businessKey 都加这前缀
TEST_PREFIX="${TEST_PREFIX:-t$$-$(date +%s%N)}"

# 拿 token
get_token() {
  local user="$1"
  local pass="$2"
  curl -sS -m 5 -X POST "$KC_URL/realms/$REALM/protocol/openid-connect/token" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "grant_type=password" -d "client_id=$CLIENT_ID" \
    -d "username=$user" -d "password=$pass" | \
    python3 -c 'import json,sys;print(json.load(sys.stdin).get("access_token",""))'
}

# 看 /api/profiles/me
get_profile() {
  local token="$1"
  curl -sS -m 5 "$API_BASE/profiles/me" -H "Authorization: Bearer $token"
}

# 启动简单审批流程(供审批中心测试用)— bk 自动加 prefix
start_simple_approval() {
  local token="$1"
  local business_key="$2"
  local business_type="$3"
  local extra_vars="${4-}"
  local bk="${TEST_PREFIX}-${business_key}"
  local vars_json
  if [ -z "$extra_vars" ]; then
    vars_json="{\"businessType\":\"$business_type\"}"
  else
    vars_json="{\"businessType\":\"$business_type\",$extra_vars}"
  fi
  curl -sS -m 5 -X POST "$API_BASE/workflow/instances" \
    -H "Authorization: Bearer $token" -H "Content-Type: application/json" \
    -d "{\"businessKey\":\"$bk\",\"variables\":$vars_json}"
  echo "$bk" > /tmp/last_bk
}

# 拿上一次启动的 businessKey(用于后续断言/清理)
last_bk() { cat /tmp/last_bk 2>/dev/null; }

# 用 token 启动并返回 process id
start_simple_approval_get_id() {
  local token="$1"
  local business_key="$2"
  local business_type="$3"
  local extra_vars="${4-}"
  [ -z "$extra_vars" ] && extra_vars="{}"
  local bk="${TEST_PREFIX}-${business_key}"
  local resp
  resp=$(curl -sS -m 5 -X POST "$API_BASE/workflow/instances" \
    -H "Authorization: Bearer $token" -H "Content-Type: application/json" \
    -d "{\"businessKey\":\"$bk\",\"variables\":{\"businessType\":\"$business_type\",$extra_vars}}")
  echo "$resp" | python3 -c 'import json,sys;print(json.load(sys.stdin).get("id",""))'
  echo "$bk" > /tmp/last_bk
}

# 通用:启动指定 processDefinitionKey 的流程(返回 process id,保存 bk)
start_workflow() {
  local token="$1"
  local process_def_key="$2"
  local business_key="$3"
  local vars_json="${4-}"
  [ -z "$vars_json" ] && vars_json="{}"
  local bk="${TEST_PREFIX}-${business_key}"
  local resp
  resp=$(curl -sS -m 5 -X POST "$API_BASE/workflow/instances" \
    -H "Authorization: Bearer $token" -H "Content-Type: application/json" \
    -d "{\"businessKey\":\"$bk\",\"processDefinitionKey\":\"$process_def_key\",\"variables\":$vars_json}")
  echo "$resp" | python3 -c 'import json,sys;print(json.load(sys.stdin).get("id",""))'
  echo "$bk" > /tmp/last_bk
}

# 拉待办(全部)
get_my_tasks() {
  local token="$1"
  curl -sS -m 5 "$API_BASE/workflow/tasks/me" -H "Authorization: Bearer $token"
}

# 拉本测试 bk 对应的 active task(隔离)
get_active_task_by_bk() {
  local token="$1"
  local bk="$2"
  curl -sS -m 5 "$API_BASE/workflow/process-instances/by-business-key/$bk/active-task" \
    -H "Authorization: Bearer $token" | python3 -c '
import json,sys
d = json.load(sys.stdin)
t = d.get("task") or {}
print(t.get("id","") if t else "")
'
}

# 拉本测试 bk 对应的 active task 完整 JSON(隔离)
get_active_task_json() {
  local token="$1"
  local bk="$2"
  curl -sS -m 5 "$API_BASE/workflow/process-instances/by-business-key/$bk/active-task" \
    -H "Authorization: Bearer $token"
}

# 完成待办
complete_task() {
  local token="$1"
  local task_id="$2"
  local action="${3:-APPROVE}"
  local comment="${4:-smoke approve}"
  curl -sS -m 5 -X POST "$API_BASE/workflow/tasks/$task_id/complete" \
    -H "Authorization: Bearer $token" -H "Content-Type: application/json" \
    -d "{\"action\":\"$action\",\"comment\":\"$comment\"}"
}

# 拉菜单
get_menu() {
  local token="$1"
  curl -sS -m 5 "$API_BASE/menus/me" -H "Authorization: Bearer $token" | \
    python3 -c 'import json,sys;d=json.load(sys.stdin); print(json.dumps(d.get("items", d if isinstance(d, list) else [])))'
}

# 简单断言:响应中包含某字符串
expect_contains() {
  local label="$1"
  local haystack="$2"
  local needle="$3"
  if echo "$haystack" | grep -q "$needle"; then
    echo "  ✅ $label: contains '$needle'"
  else
    echo "  ❌ $label: NOT contains '$needle'"
    echo "  raw: $haystack"
    return 1
  fi
}

# 简单断言:响应中不含某字符串
expect_not_contains() {
  local label="$1"
  local haystack="$2"
  local needle="$3"
  if echo "$haystack" | grep -q "$needle"; then
    echo "  ❌ $label: 仍包含 '$needle'(不应可见)"
    return 1
  else
    echo "  ✅ $label: 不含 '$needle'"
  fi
}

# 计数
count_json() {
  local json="$1"
  echo "$json" | python3 -c 'import json,sys;print(len(json.load(sys.stdin)))' 2>/dev/null || echo "0"
}

# 隔离: 拉所有 active process instances id
list_active_processes() {
  curl -sS -m 5 -u "$FUSER:$FPASS" \
    "$FBASE/runtime/process-instances?size=200" | python3 -c '
import json,sys
d=sys.stdin.read().strip()
if not d: sys.exit(0)
arr=(json.loads(d) or {}).get("data",[])
for t in arr:
    print(t.get("id",""))
'
}

# 隔离: 删除指定 process instance(Flowable REST DELETE)
delete_process() {
  local proc_id="$1"
  local reason="${2:-test cleanup}"
  local encoded
  encoded=$(printf '%s' "$reason" | python3 -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.stdin.read()))')
  curl -sS -m 5 -u "$FUSER:$FPASS" -X DELETE \
    "$FBASE/runtime/process-instances/$proc_id?deleteReason=$encoded" \
    -o /dev/null -w '%{http_code}\n'
}

# 隔离: 测试前置清理 — 删除所有 active 流程(不区分 businessKey)
# 在顺序跑多个测试时调用,保证状态干净
reset_all_processes() {
  local ids
  ids=$(list_active_processes)
  local n=0
  for pid in $ids; do
    [ -n "$pid" ] || continue
    delete_process "$pid" "test reset" >/dev/null
    n=$((n+1))
  done
  if [ "$n" -gt 0 ]; then
    echo "  [reset] 删除了 $n 个 active 流程"
  fi
  return 0
}

# 隔离: 测试后清理 — 只删带本测试 prefix 的流程
cleanup_prefix_processes() {
  local prefix="$TEST_PREFIX"
  local ids
  ids=$(list_active_processes)
  local n=0
  for pid in $ids; do
    [ -n "$pid" ] || continue
    # 取 bk 然后判断是否含 prefix
    local bk
    bk=$(curl -sS -m 3 -u "$FUSER:$FPASS" \
      "$FBASE/runtime/process-instances/$pid" | python3 -c '
import json,sys
d=sys.stdin.read().strip()
if d: print(json.loads(d).get("businessKey",""))
' 2>/dev/null)
    if [[ "$bk" == "$prefix"* ]]; then
      delete_process "$pid" "test cleanup" >/dev/null
      n=$((n+1))
    fi
  done
  if [ "$n" -gt 0 ]; then
    echo "  [cleanup] 删除了 $n 个 $prefix 流程"
  fi
  return 0
}

# 用 trap 在退出时自动清理
trap 'cleanup_prefix_processes 2>/dev/null || true' EXIT

