#!/usr/bin/env bash
# 一键跑中层 5 角色 API smoke
# 顺序:production / quality / procurement / equipment / it
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PASS=0
FAIL=0
FAILED=()

for s in test-mgr-production.sh test-mgr-quality.sh test-mgr-procurement.sh test-mgr-equipment.sh test-mgr-it.sh; do
  printf '\n============================================================\n'
  printf '  %s\n' "$s"
  printf '============================================================\n'
  if bash "$SCRIPT_DIR/$s"; then
    PASS=$((PASS+1))
  else
    FAIL=$((FAIL+1))
    FAILED+=("$s")
  fi
done

printf '\n============================================================\n'
printf '  SUMMARY: pass=%d fail=%d\n' "$PASS" "$FAIL"
if [ "$FAIL" -gt 0 ]; then
  printf '  FAILED: %s\n' "${FAILED[*]}"
  exit 1
fi
printf '  ALL GREEN\n'
