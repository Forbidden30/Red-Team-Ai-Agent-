#!/usr/bin/env bash
# Append a structured JSON event line to the active engagement's events.jsonl.
# Usage: append_log_entry.sh <type> <key=value> [<key=value> ...]
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENG="${ENGAGEMENT:-}"
[[ -z "$ENG" ]] && { echo "ENGAGEMENT not set." >&2; exit 1; }
type="${1:?event type required}"
shift

dir="$ROOT/engagements/$ENG"
mkdir -p "$dir"
log="$dir/events.jsonl"

args=(--arg type "$type" --arg ts "$(date -u +%FT%TZ)" --arg engagement "$ENG")
filter='{ts:$ts, type:$type, engagement:$engagement}'
for kv in "$@"; do
  k="${kv%%=*}"
  v="${kv#*=}"
  args+=(--arg "$k" "$v")
  filter+=" + {$k: \$$k}"
done

jq -nc "${args[@]}" "$filter" >> "$log"
