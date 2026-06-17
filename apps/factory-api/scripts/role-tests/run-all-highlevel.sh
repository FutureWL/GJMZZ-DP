#!/usr/bin/env bash
# 跑所有高层 5 角色的 API smoke test
# 用法:bash apps/factory-api/scripts/role-tests/run-all-highlevel.sh

set -uo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

ROLES=(ceo ceo-deputy vp-sales vp-mfg vp-finance)

PASS=0
FAIL=0
FAILED_ROLES=()

for r in "${ROLES[@]}"; do
  echo
  echo "============================================================"
  echo "  $r"
  echo "============================================================"
  if bash "$SCRIPT_DIR/test-$r.sh"; then
    PASS=$((PASS+1))
  else
    FAIL=$((FAIL+1))
    FAILED_ROLES+=("$r")
  fi
done

echo
echo "============================================================"
echo "  SUMMARY: pass=$PASS fail=$FAIL"
if [ "$FAIL" -gt 0 ]; then
  echo "  FAILED: ${FAILED_ROLES[*]}"
  exit 1
fi
echo "  ALL GREEN"
