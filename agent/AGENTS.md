# Agents

This directory holds the **agent personas** the red-team copilot can switch into. Each agent
has a focused role, a system prompt, and a place in the 5-phase engagement workflow:

```
Recon → Collect → Test → Exploit + OSINT → Report
```

## Roster

| Agent | Phase(s) | Purpose |
|---|---|---|
| `operator` | all | Orchestrates the engagement, routes work to specialists, owns engagement state |
| `recon-specialist` | recon, collect | External & active recon, attack-surface mapping, intel.md keeper |
| `source-analyzer` | collect, test | Code / artifact review (source, JS bundles, mobile APKs, binaries) |
| `vulnerability-analyst` | test | Vulnerability triage, CVE lookup, CVSS / VRT scoring, exploitability |
| `exploit-developer` | exploit | Proof-of-concept construction within scope, advisory-style |
| `fuzzer` | test, exploit | Targeted fuzzing strategy (input fuzzers, web fuzzers, protocol fuzzers) |
| `osint-analyst` | recon, exploit | Open-source intelligence: leaks, dorks, breach data, social, infra DNA |
| `report-writer` | report | Findings, executive summary, remediation backlog, VRT/CVSS scoring |

## File layout

```
agent/
├── operator-core.md                 # Core operator orchestration prompt (canonical)
├── CLAUDE.md                        # Instructions for Claude Code users
├── AGENTS.md                        # This file
├── .claude/agents/                  # Claude Code subagent definitions
├── .codex/agents/                   # Codex agent configs
├── .opencode/                       # OpenCode plugin + commands + prompts
│   ├── commands/                    # Slash commands (/recon, /scan, /report, ...)
│   ├── prompts/agents/              # Specialist agent prompts (.txt)
│   ├── instructions/                # Top-level instruction doc
│   └── plugins/                     # Engagement-hooks plugin
├── engagements/                     # Per-engagement workspaces (gitignored content)
├── references/                      # Methodology + payload + tool references
└── scripts/                         # Engagement-management shell helpers
```

## Picking an agent from the orchestrator

The web orchestrator (in `../orchestrator/`) exposes a subset of these as **modes**:

| Mode | Backing agent prompt |
|---|---|
| OSINT | osint-analyst |
| Reconnaissance | recon-specialist |
| Vulnerability Analysis | vulnerability-analyst |
| Internal Pentest | operator + handoffs |
| Report Writing | report-writer |
| Defense / Blue Team | report-writer with defensive system prompt |

When using a CLI (Claude Code / OpenCode / Codex), the operator dispatches sub-agents via the
files under `.claude/agents/`, `.opencode/prompts/agents/`, and `.codex/agents/`.
