<p align="center">
  <h1 align="center">Red Team AI Agent</h1>
  <p align="center"><strong>AI copilot for authorized red-team & internal-pentest engagements.</strong></p>
  <p align="center">
    <a href="#installation">Install</a> ·
    <a href="#quick-start">Quick Start</a> ·
    <a href="#architecture">Architecture</a> ·
    <a href="#cli-integration">CLI Integration</a> ·
    <a href="#legal">Legal</a>
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/Next.js-14-black" alt="Next.js" />
    <img src="https://img.shields.io/badge/AI-Anthropic%20Claude-orange" alt="Anthropic" />
    <img src="https://img.shields.io/badge/CLI-Claude%20Code%20%7C%20OpenCode%20%7C%20Codex-blue" alt="CLIs" />
    <img src="https://img.shields.io/badge/agents-8%20specialized-red" alt="Agents" />
    <img src="https://img.shields.io/badge/license-MIT-green" alt="License" />
  </p>
</p>

---

An operator-assisted AI copilot for authorized offensive-security engagements
(penetration tests, bug-bounty research, internal red-team exercises). It transforms a
workspace into a structured **Recon → Collect → Test → Exploit+OSINT → Report** pipeline,
backed by **8 specialized AI agents**, **per-engagement scope guardrails**, and a
**reference library** of OWASP / API-security / AD / tooling methodology.

**This is not an autonomous attack tool.** The human operator approves every active step.
The orchestrator is a force-multiplier, not a decider.

## Features

- **5-phase engagement pipeline** — Recon → Collect → Test → Exploit+OSINT → Report.
- **8 specialized AI agents** —
  `operator` · `recon-specialist` · `source-analyzer` · `vulnerability-analyst` ·
  `exploit-developer` · `fuzzer` · `osint-analyst` · `report-writer`.
- **Web orchestrator (Next.js)** — chat UI with scope-gated modes; **server-side
  streaming** via SSE, full **markdown rendering** with copy-to-clipboard, and a
  **findings viewer** that browses the engagement workspace on disk.
- **`rt-agent` CLI** — standalone bash CLI that implements all the slash commands as
  real shell behavior (engage / auth / status / finding / queue / note / report).
- **CLI integration** — works with Claude Code, OpenCode, and Codex via
  `agent/.claude/`, `agent/.opencode/`, and `agent/.codex/` configurations.
- **Engagement workspaces** — per-engagement `scope.json`, `intel.md`, `findings/`,
  `artifacts/`, `reports/`, `events.jsonl`. Resumable.
- **Scope-aware guardrails** — `agent/scripts/hooks/scope-check.sh` blocks commands
  that target hosts outside the authorized list.
- **Reference library** — OWASP Top 10 (Web), OWASP API Security Top 10, AD
  methodology (enumeration, Kerberos, ADCS), payload methodology (XSS, SQLi, SSTI,
  SSRF, path traversal, command injection), defense (Sigma rules, hardening
  checklist), tool cheat-sheets (nmap, ffuf, nuclei, httpx, subfinder, amass,
  gobuster, dirsearch, sqlmap, jwt_tool).
- **Tests** — 28 vitest unit tests (prompts, modes, engagements lib, API route
  validation) + 17 bash tests for the CLI. Run with `npm test` in `orchestrator/`
  and `bash tests/cli/test_rt_agent.sh` at the repo root.
- **CI / supply-chain hygiene** — GitHub Actions for typecheck + tests + build +
  shellcheck + reference link sanity. CodeQL workflow. Dependabot.
- **Containerized toolbox (optional)** — Kali + mitmproxy + all-in-one Docker images.
- **Report-ready output** — VRT-classified findings, CVSS 3.1 vectors, exec summary,
  remediation backlog, Sigma detection rules paired with offensive findings.

## Architecture

```
red-team-ai-agent/
├── README.md                     # this file
├── install.sh                    # bootstrapper
├── LICENSE                       # MIT
├── SECURITY.md                   # responsible-disclosure policy
├── CONTRIBUTING.md
├── docs/                         # architecture, methodology, usage
│
├── orchestrator/                 # Next.js web UI
│   ├── app/                      # routes (Next 14 app router)
│   │   ├── page.tsx              # main page
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── api/chat/route.ts     # server-side proxy to Anthropic (API key stays here)
│   ├── components/               # React components
│   │   ├── RedTeamAgent.tsx
│   │   ├── AuthorizationGate.tsx # scope-acceptance modal
│   │   ├── ScopeBanner.tsx
│   │   ├── PhaseTimeline.tsx
│   │   ├── ModeSelector.tsx
│   │   ├── QuickActions.tsx
│   │   └── ChatPanel.tsx
│   ├── lib/                      # types, modes, system prompts
│   └── package.json
│
└── agent/                        # CLI agent + reference library
    ├── CLAUDE.md                 # entry point for Claude Code
    ├── AGENTS.md                 # agent roster + role matrix
    ├── operator-core.md          # canonical orchestrator prompt
    ├── .claude/agents/           # Claude Code subagent definitions
    ├── .codex/agents/            # Codex agent configs
    ├── .opencode/
    │   ├── opencode.json
    │   ├── commands/             # /auth /engage /recon /vuln-analyze /report ...
    │   ├── prompts/agents/       # 8 specialist agent prompts (.txt)
    │   ├── plugins/              # engagement-hooks
    │   └── instructions/
    ├── engagements/              # per-engagement workspaces (gitignored)
    ├── references/               # methodology & checklists
    │   ├── INDEX.md
    │   ├── handoff-protocols.md
    │   ├── wildcard-mode.md
    │   ├── vuln-checklists/      # OWASP A01–A10
    │   ├── api-security/         # OWASP API1–API10
    │   ├── active-directory/     # enumeration, Kerberos, ADCS
    │   └── tools/recon/          # nmap, ffuf, nuclei, httpx, subfinder, amass
    ├── scripts/                  # engagement-management shell helpers
    │   ├── hooks/scope-check.sh
    │   ├── allocate_finding_id.sh
    │   ├── append_finding.sh
    │   ├── append_log_entry.sh
    │   ├── finalize_engagement.sh
    │   ├── check_findings_integrity.sh
    │   ├── schema.sql
    │   ├── templates/intel.md
    │   └── proxy_addon.py        # mitmproxy engagement-aware addon
    └── docker/                   # Optional Kali / mitmproxy / allinone images
        ├── docker-compose.yml
        ├── kali-redteam/Dockerfile
        ├── mitmproxy/Dockerfile
        └── redteam-allinone/
```

## Installation

### Prerequisites

- **Node.js >= 18.18** (for the orchestrator)
- An **Anthropic API key** (https://console.anthropic.com/)
- Optional: one or more AI CLIs (Claude Code, OpenCode, Codex)
- Optional: Docker (for the containerized toolbox)

### Install

```bash
git clone https://github.com/Forbidden30/Red-Team-Ai-Agent-.git
cd Red-Team-Ai-Agent-
./install.sh
```

Then edit `orchestrator/.env.local` and set:

```env
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-4-6
```

### Run the web orchestrator

```bash
cd orchestrator
npm run dev
```

Open http://localhost:3000.

### Use the `rt-agent` CLI (no AI CLI needed)

A standalone bash CLI is at `bin/rt-agent`. It implements the slash-command contracts
documented in `agent/.opencode/commands/` as real shell behavior, so you can drive an
engagement without any AI CLI:

```bash
./bin/rt-agent engage acme-q2
./bin/rt-agent auth                           # interactive scope.json setup
./bin/rt-agent intel-add Hosts "api.acme.example — Cloudflare, Next.js"
./bin/rt-agent finding "Reflected XSS in /search" High XSS
./bin/rt-agent queue add recon-specialist SSRF artifacts/ssrf-1.txt
./bin/rt-agent note "switched to vuln-analyze phase"
./bin/rt-agent status                         # show engagement state
./bin/rt-agent report                         # bundle reports/final-report.md

# One-shot chat against the orchestrator (must be running on :3000)
./bin/rt-agent chat osint "Subdomain enum plan for example.com"
```

Symlink to PATH for convenience: `sudo ln -s $(pwd)/bin/rt-agent /usr/local/bin/rt-agent`.

### Optional: build the Docker toolbox

```bash
./install.sh --with-docker
docker compose -f agent/docker/docker-compose.yml up -d
docker compose -f agent/docker/docker-compose.yml exec kali-toolbox bash
```

## Quick Start

1. Open the web orchestrator at http://localhost:3000.
2. Click **Define scope** and fill in:
   - Engagement name (e.g. `acme-q2-pentest`)
   - Authorizer name + email
   - In-scope targets (one per line; `*.example.com`, `10.20.0.0/16`, etc.)
   - Out-of-scope rules (optional)
   - Tick the authorization confirmation.
3. Select a mode (OSINT / Recon / Vuln Analysis / Internal / Report / Defense).
4. Pick a **Quick prompt** or type your own. Output streams from the operator agent.

For CLI use, see [CLI Integration](#cli-integration).

## CLI Integration

The same engagement workspace works from any of three CLIs.

### Claude Code

```bash
cd Red-Team-Ai-Agent-
claude
```

`agent/.claude/agents/operator.md` is loaded automatically. Subagents
(`recon-specialist`, `vulnerability-analyst`, …) are available via prompt switching.

### OpenCode

```bash
cd Red-Team-Ai-Agent-/agent
opencode
```

`opencode.json` wires up the operator + slash commands (`/auth`, `/engage`, `/recon`,
`/vuln-analyze`, `/exploit`, `/report`, `/status`, `/resume`, `/stop`, …).

### Codex

```bash
cd Red-Team-Ai-Agent-
codex --agent agent/.codex/agents/operator.toml
```

## Agent roster

| Agent | Phase(s) | Purpose |
|---|---|---|
| `operator` | all | Orchestrates the engagement, routes work to specialists |
| `recon-specialist` | recon, collect | External & active recon, attack-surface mapping |
| `source-analyzer` | collect, test | Code / artifact review (source, JS, mobile, binaries) |
| `vulnerability-analyst` | test | Vulnerability triage, CVE lookup, CVSS / VRT scoring |
| `exploit-developer` | exploit | Minimal proof-of-impact, in-scope only, advisory-style |
| `fuzzer` | test, exploit | Targeted fuzzing strategy (web / binary / protocol) |
| `osint-analyst` | recon, exploit | Open-source intel — leaks, dorks, breach data, infra DNA |
| `report-writer` | report | Findings, exec summary, remediation backlog, VRT/CVSS scoring |

See [`agent/AGENTS.md`](./agent/AGENTS.md) for details.

## Engagement lifecycle

```
/auth         — confirm written authorization, set scope
/engage NAME  — initialize agent/engagements/NAME/
/recon        — passive + active recon
/enumerate    — surface enumeration
/vuln-analyze — triage findings
/exploit F-NN — proof of impact
/osint        — OSINT enrichment
/report       — draft findings + exec summary
/stop /resume — pause/restart cleanly
```

## Legal

This tool is for **authorized security testing only**. Unauthorized access to computer
systems is illegal under the CFAA (US), Computer Misuse Act (UK), IT Act (India), and
similar laws worldwide. By using this software you agree to:

- Operate only against systems you own or have **explicit written authorization** to test.
- Stay within the documented engagement scope.
- Follow responsible-disclosure norms when reporting findings.

See [SECURITY.md](./SECURITY.md) for the project's responsible-disclosure policy.

## License

MIT — see [LICENSE](./LICENSE).

## Acknowledgements

Structure inspired by [NeoTheCapt/RedteamAgent](https://github.com/NeoTheCapt/RedteamAgent).
References derive from OWASP, PortSwigger Web Security Academy, HackTricks, SpecterOps
research, MITRE ATT&CK, and ProjectDiscovery tool documentation.
