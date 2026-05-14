#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${ANTHROPIC_API_KEY:-}" ]]; then
  echo "ANTHROPIC_API_KEY not set. Aborting." >&2
  exit 1
fi

cd /app/orchestrator
exec npm start
