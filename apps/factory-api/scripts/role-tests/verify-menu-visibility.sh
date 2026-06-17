#!/usr/bin/env bash
# verify-menu-visibility.sh - 验证 5 个不同 position 的菜单可见性
# 用法:bash scripts/role-tests/verify-menu-visibility.sh
set -uo pipefail

KC_URL="${KEYCLOAK_URL:-http://localhost:18080}"
REALM="${REALM:-factory-platform}"
CLIENT_ID="${CLIENT_ID:-dev-cli}"
API_BASE="${API_BASE:-http://localhost:33700/api}"

# 用 mktemp 拿一个临时文件
TMP_MENU=$(mktemp /tmp/menu_XXXXXX.json)
trap 'rm -f "$TMP_MENU"' EXIT

# 把 TMP_MENU 暴露给 python
export TMP_MENU

# 取 token
get_token() {
  curl -sS -m 5 -X POST "$KC_URL/realms/$REALM/protocol/openid-connect/token" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "grant_type=password" -d "client_id=$CLIENT_ID" \
    -d "username=$1" -d "password=$2" | \
    python3 -c 'import json,sys;print(json.load(sys.stdin).get("access_token",""))'
}

# 拿用户菜单写到 TMP_MENU
fetch_menu() {
  local user="$1"
  local token; token=$(get_token "$user" "Pass1234!")
  if [ -z "$token" ]; then
    echo '{"items":[]}' > "$TMP_MENU"
    return 1
  fi
  curl -sS -m 5 "$API_BASE/menus/me" -H "Authorization: Bearer $token" > "$TMP_MENU"
}

# 取概要
get_pos() { python3 -c 'import json,os;print(json.load(open(os.environ["TMP_MENU"])).get("profilePosition","-"))'; }
get_count() { python3 -c 'import json,os;print(json.load(open(os.environ["TMP_MENU"])).get("count",0))'; }

# 检查 path 是否可见
has_path() {
  python3 << PYEOF
import json, os
d = json.load(open(os.environ["TMP_MENU"]))
paths = {i['path'] for i in d.get('items', []) if i.get('path')}
import sys
sys.exit(0 if "$1" in paths else 1)
PYEOF
}

# 断言可见
assert_visible() {
  local user="$1"; shift
  fetch_menu "$user" || { echo "  ✗ $user: token 获取失败"; return 1; }
  local pos; pos=$(get_pos)
  local count; count=$(get_count)
  local hits=0
  local total=$#
  for p in "$@"; do
    if has_path "$p"; then
      hits=$((hits+1))
    else
      echo "  ✗ $user(pos=$pos, count=$count): 期望见 $p 但实际不见"
    fi
  done
  echo "  ✓ $user(pos=$pos, count=$count): 见 $hits/$total 个期望路径"
}

# 断言隐藏
assert_hidden() {
  local user="$1"; shift
  fetch_menu "$user" || { echo "  ✗ $user: token 获取失败"; return 1; }
  local pos; pos=$(get_pos)
  local hits=0
  local total=$#
  for p in "$@"; do
    if has_path "$p"; then
      echo "  ✗ $user(pos=$pos): 不应见 $p 但实际可见"
    else
      hits=$((hits+1))
    fi
  done
  echo "  ✓ $user(pos=$pos): 隐藏 $hits/$total 个不该见的路径"
}

echo "=== 角色 → 菜单可见性 验证 ==="
echo ""

# inspector (quality): 仅质量检验 + 审批中心 + 通知 + 工作台
echo "[inspector (position=quality)]"
assert_visible  inspector /quality/inspections /quality/traceability /workbench /management/approval /management/notifications
assert_hidden   inspector /equipment/workorders /equipment/monitoring /sales/order /supply/procurement/orders /production/execution/dispatch /management/security/permissions /management/erp/expenses
echo ""

# tech (plant_manager): 设备运维 + 报工 + 费用报销 + 审批 + 通知
echo "[tech (position=plant_manager)]"
assert_visible  tech /equipment/workorders /equipment/monitoring /equipment/dashboard /production/execution/reporting /management/erp/expenses /management/approval /workbench
assert_hidden   tech /quality/inspections /quality/traceability /sales/order /supply/procurement/orders /production/execution/scheduling /production/execution/workorders
echo ""

# mgr-production (manager): 全业务 + 权限矩阵
echo "[mgr-production (position=manager)]"
assert_visible  mgr-production /production/execution/scheduling /production/execution/workorders /production/execution/dispatch /sales/order /quality/delivery-overview /quality/inspections /equipment/workorders /supply/procurement/orders /management/security/permissions /workbench
echo "(manager 不应隐藏任何菜单项)"
echo ""

# mgr-procurement (approver): 全业务(除权限矩阵) + 审计日志
echo "[mgr-procurement (position=approver)]"
assert_visible  mgr-procurement /supply/procurement/orders /supply/procurement/create-pr /supply/suppliers/list /workbench /quality/inspections /equipment/workorders /production/execution/scheduling /sales/order /management/audit/log
assert_hidden   mgr-procurement /management/security/permissions
echo ""

# ceo (approver 高层): 同 approver
echo "[ceo (position=approver 高层)]"
assert_visible  ceo /supply/procurement/orders /quality/inspections /equipment/workorders /production/execution/scheduling /sales/order /management/audit/log
# 高层无 /management/security/permissions (仅 manager/quality_manager/plant_manager)
assert_hidden   ceo /management/security/permissions
echo ""

echo "=== 全部完成 ==="