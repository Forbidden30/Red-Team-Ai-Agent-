#!/usr/bin/env bash
# Template — copy to run.sh, fill in env, run.
set -euo pipefail

docker run --rm -it \
  -e ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY:-}" \
  -e ANTHROPIC_MODEL="${ANTHROPIC_MODEL:-claude-sonnet-4-6}" \
  -e ENGAGEMENT="${ENGAGEMENT:-demo}" \
  -p 3000:3000 \
  -v "$(pwd)/agent/engagements:/app/agent/engagements" \
  rt-ai-agent-allinone:latest
