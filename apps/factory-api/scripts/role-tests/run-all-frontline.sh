#!/usr/bin/env bash
# 一键跑基层 5 角色 API smoke
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PASS=0
FAIL=0
FAILED=()

for s in test-worker-leader.sh test-planner.sh test-inspector.sh test-tech.sh test-warehouse.sh; do
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
