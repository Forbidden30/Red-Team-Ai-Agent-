#!/usr/bin/env bash
# Verify every finding has the required fields filled in.
# Exit non-zero if any finding is missing required sections.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENG="${1:-${ENGAGEMENT:-}}"
[[ -z "$ENG" ]] && { echo "Usage: check_findings_integrity.sh <engagement>" >&2; exit 1; }

dir="$ROOT/engagements/$ENG/findings"
[[ -d "$dir" ]] || { echo "no findings dir for $ENG"; exit 0; }

required=("Severity" "Class" "Status" "Affected asset" "## Steps to reproduce" "## Impact" "## Recommendation")
fail=0

for f in "$dir"/F-*.md; do
  [[ -e "$f" ]] || continue
  for r in "${required[@]}"; do
    if ! grep -qF "$r" "$f"; then
      echo "MISSING: $r — in $f"
      fail=1
    fi
  done
  if grep -q "TBD" "$f"; then
    echo "TBD remaining: $f"
    fail=1
  fi
done

exit $fail
