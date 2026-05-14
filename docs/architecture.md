# Architecture

How the pieces fit together.

## High-level

```
┌─────────────────────────┐         ┌──────────────────────────┐
│  Orchestrator (Next.js) │ <─────> │  Anthropic API (server)  │
│  - Web UI               │         │  - claude-sonnet-4-6     │
│  - Scope management     │         │    (default)             │
│  - Mode-based chat      │         └──────────────────────────┘
└──────────┬──────────────┘
           │                                                       
           ▼                                                       
┌─────────────────────────┐
│  Agent workspace        │   Same workspace can be driven from
│  (filesystem)           │   Claude Code / OpenCode / Codex CLI.
│  agent/engagements/...  │
└─────────────────────────┘
```

## The orchestrator (web UI)

- Next.js 14 app-router.
- Server-side route at `app/api/chat/route.ts` proxies to Anthropic with prompt
  caching. The API key never leaves the server.
- Mode-based UI: OSINT / Recon / Vuln Analysis / Internal / Report / Defense. Active
  modes are gated behind an accepted scope (`AuthorizationGate.tsx`).
- Scope is persisted to `localStorage` so the page survives reloads.
- Each request to `/api/chat` includes the current scope; the system prompt
  (`lib/prompts.ts`) embeds it into the LLM's context so the model is aware of
  authorized targets.

## The agent workspace (CLI / filesystem)

- `agent/operator-core.md` is the canonical orchestration prompt.
- `agent/.claude/`, `agent/.codex/`, `agent/.opencode/` are CLI-specific entry points
  that all reference the same `operator-core.md`.
- The 8 specialist agents live as separate prompt files (under
  `.opencode/prompts/agents/`); the operator dispatches them by reading the right
  prompt for the current sub-task.
- `agent/engagements/<name>/` is the canonical engagement state. Every agent reads /
  writes this directory.

## Engagement state model

```
agent/engagements/<name>/
├── scope.json            # ground truth — set via /auth
├── intel.md              # accumulated knowledge
├── notes.md              # operator's running log
├── events.jsonl          # structured event log
├── findings/             # per-finding markdown
│   ├── F-01-<slug>.md
│   ├── F-01/
│   │   └── proof-of-impact.md
│   └── ...
├── artifacts/            # captured raw evidence
│   ├── proxy/            # mitmproxy flows
│   └── ...
├── cases.sqlite          # case queue (optional, see scripts/schema.sql)
└── reports/              # generated reports
    ├── exec-summary.md
    ├── findings-report.md
    └── remediation-backlog.md
```

## Trust boundaries

- **User → orchestrator UI:** standard HTTP. Don't expose to the internet — this is a
  local-dev tool.
- **Orchestrator UI → orchestrator API:** same-origin only by default; configurable via
  `ALLOWED_ORIGINS` env. Optional `API_SHARED_SECRET` for an extra layer.
- **Orchestrator API → Anthropic:** outbound HTTPS with the user's API key. Key never
  reaches the browser.
- **Agent → target system:** outside the orchestrator's control. The scope-check hook
  catches obvious mistakes; the human is responsible for the rest.

## Why "operator-assisted" not "autonomous"

This project deliberately keeps the human in the loop on every active step. The
agents propose; the operator approves. Reasons:

1. **Authorization is human-only.** The model can't validate that a given target is in
   scope beyond what the scope.json file says, and even that file is only as accurate
   as the human who wrote it.
2. **Judgement still lives with the human.** Severity, business impact, disclosure
   timing — all need the engagement's context that doesn't live in the file system.
3. **Liability.** Whoever pressed "go" is responsible. Keeping that explicit prevents
   "the AI did it" attribution failures.

The orchestrator surfaces this in the UI (scope banner, quick prompts) and in the
agent prompts (`exploit-developer.txt`'s hard rules, `operator-core.md`'s "stop on
uncertainty").
