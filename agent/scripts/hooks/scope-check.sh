#!/usr/bin/env bash
# scope-check.sh — refuse Bash commands that target out-of-scope hosts.
#
# Called by the OpenCode / Claude Code preTool hook with the proposed command as $1.
# Exit 0 = allow. Non-zero = deny (reason on stderr).
#
# Scope is read from agent/engagements/<active>/scope.json. The active engagement is
# either $ENGAGEMENT or, if unset, the only directory under agent/engagements/.
#
# This is a heuristic guardrail — not a sandbox. It catches obvious mistakes; it does
# not replace human review on active steps.

set -euo pipefail

cmd="${1:-}"
[[ -z "$cmd" ]] && exit 0

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ENG="${ENGAGEMENT:-}"

if [[ -z "$ENG" ]]; then
  dirs=("$ROOT/engagements"/*/)
  if [[ ${#dirs[@]} -eq 1 && -d "${dirs[0]}" ]]; then
    ENG="$(basename "${dirs[0]}")"
  fi
fi

scope="$ROOT/engagements/$ENG/scope.json"

# No scope, no active commands. Permit only obviously-passive ones.
if [[ ! -f "$scope" ]]; then
  if [[ "$cmd" =~ ^(ls|cat|head|tail|rg|grep|find|jq|awk|sed|echo|pwd|wc|sort|uniq)\  ]] || \
     [[ "$cmd" =~ ^git\  ]]; then
    exit 0
  fi
  echo "scope-check: no scope.json for engagement '$ENG' — refusing command." >&2
  exit 1
fi

# Extract authorized_targets + out_of_scope.
mapfile -t allow < <(jq -r '.authorized_targets[]?' "$scope" 2>/dev/null || true)
mapfile -t deny  < <(jq -r '.out_of_scope[]?'      "$scope" 2>/dev/null || true)

# Reject if the command contains a denied host substring.
for d in "${deny[@]}"; do
  [[ -z "$d" ]] && continue
  if [[ "$cmd" == *"$d"* ]]; then
    echo "scope-check: command mentions out-of-scope target '$d'." >&2
    exit 1
  fi
done

# Heuristic: if the command mentions a hostname/IP-looking token, at least one allowed
# target must appear in the command, otherwise refuse.
if [[ "$cmd" =~ (https?://[A-Za-z0-9.-]+|\b[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\b|\b[a-z0-9-]+\.[a-z]{2,}\b) ]]; then
  hit=0
  for a in "${allow[@]}"; do
    [[ -z "$a" ]] && continue
    base="${a#\*.}"  # strip leading "*." from wildcards
    if [[ "$cmd" == *"$base"* ]]; then hit=1; break; fi
  done
  if [[ "$hit" -eq 0 ]]; then
    echo "scope-check: command appears to target a host not in authorized_targets." >&2
    echo "  command: $cmd" >&2
    echo "  authorized: ${allow[*]}" >&2
    exit 1
  fi
fi

exit 0
