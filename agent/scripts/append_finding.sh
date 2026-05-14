#!/usr/bin/env bash
# Append a new finding to the active engagement.
# Usage: append_finding.sh <title> <severity> [class]
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENG="${ENGAGEMENT:-}"

title="${1:?title required}"
severity="${2:?severity required (Critical/High/Medium/Low/Info)}"
class="${3:-Unclassified}"

if [[ -z "$ENG" ]]; then
  echo "ENGAGEMENT not set." >&2
  exit 1
fi

fid="$("$ROOT/scripts/allocate_finding_id.sh" "$ENG")"
dir="$ROOT/engagements/$ENG/findings"
mkdir -p "$dir"
slug="$(echo "$title" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g;s/^-+|-+$//g' | cut -c1-40)"
path="$dir/$fid-$slug.md"

cat > "$path" <<EOF
# $title

- ID: $fid
- Severity: $severity
- Class: $class
- Status: Open
- Created: $(date -u +%FT%TZ)
- Affected asset: TBD
- CVSS: TBD
- VRT: TBD

## Description

TBD

## Steps to reproduce

1. TBD

## Proof of impact

TBD

## Impact

TBD

## Recommendation

TBD

## References

- TBD
EOF

echo "$path"
