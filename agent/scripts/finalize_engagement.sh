#!/usr/bin/env bash
# Compose the final report bundle for an engagement.
# Concatenates exec-summary + findings into a single deliverable PDF/MD bundle.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENG="${1:-${ENGAGEMENT:-}}"
[[ -z "$ENG" ]] && { echo "Usage: finalize_engagement.sh <engagement>" >&2; exit 1; }

base="$ROOT/engagements/$ENG"
out="$base/reports/final-report.md"

[[ -f "$base/reports/exec-summary.md" ]] || { echo "missing exec-summary.md" >&2; exit 2; }

mkdir -p "$base/reports"

{
  cat "$base/reports/exec-summary.md"
  echo
  echo "---"
  echo
  echo "# Findings"
  echo
  for f in "$base"/findings/F-*.md; do
    [[ -e "$f" ]] || continue
    cat "$f"
    echo
    echo "---"
    echo
  done
} > "$out"

echo "wrote $out"
