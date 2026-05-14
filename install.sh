#!/usr/bin/env bash
# install.sh — Red Team AI Agent bootstrapper.
#
# Sets up the orchestrator (Next.js web UI) and verifies the workspace structure.
# Optionally builds the Docker toolbox.
#
# Usage:
#   ./install.sh [-h] [--with-docker] [--skip-deps]

set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
ORCH="$ROOT/orchestrator"
AGENT="$ROOT/agent"

WITH_DOCKER=0
SKIP_DEPS=0

usage() {
  cat <<'EOF'
Red Team AI Agent — installer

Usage: ./install.sh [options]

Options:
  -h, --help          Show this help.
  --with-docker       Also build the Kali / mitmproxy / allinone Docker images.
  --skip-deps         Skip npm install (assume already done).

What it does:
  1. Verifies Node >= 18.18 is installed.
  2. Runs `npm install` in orchestrator/.
  3. Copies orchestrator/.env.example to orchestrator/.env.local if missing.
  4. Verifies agent/ workspace structure.
  5. (--with-docker) Builds Kali + mitmproxy + allinone images.

Next steps after install:
  - Edit orchestrator/.env.local and set ANTHROPIC_API_KEY.
  - (Optional) Run `/engage <name>` from a Claude Code / OpenCode / Codex session in
    the project root to set up an engagement.
  - Run `cd orchestrator && npm run dev` to start the web UI on http://localhost:3000.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help) usage; exit 0 ;;
    --with-docker) WITH_DOCKER=1; shift ;;
    --skip-deps)   SKIP_DEPS=1; shift ;;
    *) echo "Unknown option: $1" >&2; usage; exit 2 ;;
  esac
done

echo "==> Red Team AI Agent installer"
echo "    Root: $ROOT"

# --- 1. Node check ----------------------------------------------------------
if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: Node.js is not installed. Need >= 18.18." >&2
  exit 1
fi
NODE_MAJOR=$(node -p "process.versions.node.split('.')[0]")
if (( NODE_MAJOR < 18 )); then
  echo "ERROR: Node $NODE_MAJOR is too old. Need >= 18.18." >&2
  exit 1
fi
echo "    Node: $(node --version)"

# --- 2. npm install ---------------------------------------------------------
if [[ "$SKIP_DEPS" -eq 0 ]]; then
  echo "==> Installing orchestrator dependencies"
  (cd "$ORCH" && npm install --no-audit --no-fund)
fi

# --- 3. .env.local ----------------------------------------------------------
if [[ ! -f "$ORCH/.env.local" ]]; then
  cp "$ORCH/.env.example" "$ORCH/.env.local"
  echo "    Created $ORCH/.env.local — edit it and set ANTHROPIC_API_KEY."
else
  echo "    Keeping existing $ORCH/.env.local"
fi

# --- 4. Workspace structure check ------------------------------------------
echo "==> Verifying agent/ workspace"
for d in \
  "$AGENT" "$AGENT/.claude" "$AGENT/.codex" "$AGENT/.opencode" \
  "$AGENT/.opencode/commands" "$AGENT/.opencode/prompts/agents" \
  "$AGENT/engagements" "$AGENT/references" "$AGENT/scripts" \
  "$AGENT/references/vuln-checklists" "$AGENT/references/api-security" \
  "$AGENT/references/payloads" "$AGENT/references/defense" \
  "$AGENT/references/tools/recon" "$ROOT/bin"
do
  if [[ ! -d "$d" ]]; then
    echo "    MISSING: $d" >&2
    exit 3
  fi
done
chmod +x "$AGENT"/scripts/*.sh "$AGENT"/scripts/hooks/*.sh 2>/dev/null || true
chmod +x "$ROOT"/bin/rt-agent 2>/dev/null || true
echo "    OK"

# --- 4b. CLI in PATH hint --------------------------------------------------
echo "==> rt-agent CLI"
if [[ ! -L "/usr/local/bin/rt-agent" && -x "$ROOT/bin/rt-agent" ]]; then
  echo "    To put rt-agent on your PATH:"
  echo "        sudo ln -s $ROOT/bin/rt-agent /usr/local/bin/rt-agent"
  echo "    Or call it directly:  $ROOT/bin/rt-agent <command>"
fi

# --- 5. Docker (optional) --------------------------------------------------
if [[ "$WITH_DOCKER" -eq 1 ]]; then
  if ! command -v docker >/dev/null 2>&1; then
    echo "ERROR: --with-docker passed but docker is not installed." >&2
    exit 4
  fi
  echo "==> Building Docker images (this can take a while)"
  docker build -t rt-ai-agent-kali:latest    -f "$AGENT/docker/kali-redteam/Dockerfile"   "$AGENT/docker/kali-redteam"
  docker build -t rt-ai-agent-mitmproxy:latest -f "$AGENT/docker/mitmproxy/Dockerfile"      "$ROOT/agent"
  docker build -t rt-ai-agent-allinone:latest -f "$AGENT/docker/redteam-allinone/Dockerfile" "$ROOT"
fi

cat <<EOF

==> Done.

Quick start:
  1. Edit  orchestrator/.env.local  and set ANTHROPIC_API_KEY.
  2. cd orchestrator && npm run dev
  3. Open http://localhost:3000 and define your engagement scope.

Project layout:
  orchestrator/     — Next.js web UI (the GUI for the operator)
  agent/            — Operator + 8 specialist agent prompts, references library, scripts
  agent/engagements — Per-engagement workspaces (scope.json + intel.md + findings + reports)
  docs/             — Architecture + methodology + usage docs

For CLI use:
  - Claude Code:   open this folder; agent/.claude/agents/operator.md is auto-loaded
  - OpenCode:      see agent/.opencode/opencode.json
  - Codex:         see agent/.codex/agents/operator.toml
EOF
