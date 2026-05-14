#!/usr/bin/env bash
# Allocate the next sequential finding ID for the active engagement.
# Usage: allocate_finding_id.sh [engagement-name]
#
# Reads agent/engagements/<eng>/findings/ and prints F-<NN+1>.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENG="${1:-${ENGAGEMENT:-}}"

if [[ -z "$ENG" ]]; then
  echo "scope: ENGAGEMENT not set and no arg passed." >&2
  exit 1
fi

dir="$ROOT/engagements/$ENG/findings"
mkdir -p "$dir"

last=0
for f in "$dir"/F-*.md "$dir"/F-*/proof-of-impact.md; do
  [[ -e "$f" ]] || continue
  n=$(basename "$(dirname "$f" 2>/dev/null)" 2>/dev/null)
  [[ "$n" =~ ^F-([0-9]+)$ ]] || n=$(basename "$f")
  if [[ "$n" =~ ^F-([0-9]+) ]]; then
    v=$((10#${BASH_REMATCH[1]}))
    (( v > last )) && last=$v
  fi
done

printf 'F-%02d\n' "$((last+1))"
