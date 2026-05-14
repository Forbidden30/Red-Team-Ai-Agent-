# Usage

How to drive the agent in day-to-day work.

## Two interfaces, one workspace

The same engagement is driven from either the **web orchestrator** or a **CLI**.
The engagement state lives in `agent/engagements/<name>/` on the filesystem; both
interfaces read and write the same files.

Pick the interface that fits the task:

- **Web orchestrator** — best for chat-style ideation, mode-based methodology
  questions, drafting reports.
- **CLI (Claude Code / OpenCode / Codex)** — best for any work that benefits from
  shell access (nmap, ffuf, curl) executed by the agent under scope-check.

## Web orchestrator

```bash
cd orchestrator
npm run dev
```

Open http://localhost:3000.

### Define scope

Click **Define scope**. Fill in the form. Tick the authorization checkbox. Active
modes (Recon, Vuln Analysis, Internal Pentest) unlock once scope is accepted.

### Modes

| Mode | When |
|------|------|
| OSINT | Passive intel gathering. Always available. |
| Reconnaissance | Active recon planning. Scope required. |
| Vulnerability Analysis | Triage a finding. Scope required. |
| Internal Pentest | Post-foothold methodology. Scope required. |
| Report Writing | Draft findings + summaries. Always available. |
| Defense | Detection rules + hardening. Always available. |

### Quick prompts

Each mode shows 3-4 ready-to-send prompts as chips. Click one or write your own.

### Session export

The **Export session** button writes the chat + scope + mode to a JSON file. Useful
as raw evidence for a report.

## CLI

### Claude Code

```bash
cd Red-Team-Ai-Agent-
claude
```

The operator agent loads from `agent/.claude/agents/operator.md`. Use slash commands
from `agent/.opencode/commands/` as prompt patterns — Claude Code doesn't have
literal slash commands, but you can reference the contracts (e.g. "follow /auth").

### OpenCode

```bash
cd Red-Team-Ai-Agent-/agent
opencode
```

Slash commands wired through `.opencode/commands/`:

```
/auth          set scope
/engage NAME   initialize agent/engagements/NAME/
/recon         dispatch recon-specialist
/enumerate     surface enumeration for a host
/subdomain     passive subdomain enum
/scan          coordinated scanner pass
/vuln-analyze  dispatch vulnerability-analyst
/exploit F-NN  build proof-of-impact for a finding
/osint         dispatch osint-analyst
/report        draft engagement report
/status        show engagement status
/resume        resume the most recent engagement
/stop          pause cleanly
/queue         show / manage case queue
/confirm F-NN  re-verify a finding
/pivot         plan a lateral move
/proxy         start mitmproxy with engagement-aware addon
/config        show / edit workspace config
/autoengage    run the full pipeline (operator-assisted)
```

### Codex

```bash
cd Red-Team-Ai-Agent-
codex --agent agent/.codex/agents/operator.toml
```

## Workflow examples

### A: External web-app pentest

```
1.  /auth              (scope: *.acme.example)
2.  /engage acme-q2
3.  /subdomain acme.example
4.  /scan              (top-1000 + httpx + nuclei)
5.  /enumerate api.acme.example
6.  Switch to web orchestrator → Vuln Analysis mode → paste suspicious request
7.  /vuln-analyze findings/candidate-01.txt
8.  /exploit F-01
9.  /report
10. ./agent/scripts/finalize_engagement.sh acme-q2
```

### B: Bug-bounty wildcard target

```
1.  /auth              (scope: *.target.example per BB policy)
2.  /engage target-bb
3.  Web orchestrator → OSINT mode → "Subdomain enum plan for target.example"
4.  Operator runs the recommended commands manually
5.  /enumerate <interesting host>
6.  Web orchestrator → Vuln Analysis mode → paste request
7.  /vuln-analyze
8.  /exploit
9.  Web orchestrator → Report Writing mode → "Bug-bounty submission"
10. Submit to the program.
```

### C: Internal red-team

```
1.  /auth              (scope: 10.10.0.0/16 per ROE)
2.  /engage corp-internal
3.  Web orchestrator → Internal Pentest mode → AD enumeration plan
4.  Operator runs BloodHound, ldapsearch
5.  /vuln-analyze findings/kerberoast-candidates.md
6.  /exploit F-01  (Kerberoast)
7.  /pivot 10.10.5.4 -> 10.10.10.10
8.  /report
```

## Tips

- **Don't paste live data into the chat unless needed for triage.** The model gets
  the prompt; treat it as a third party.
- **Use the export feature regularly.** Sessions can get long; exports are your
  audit trail.
- **Confirm scope every time you switch engagements.** The orchestrator's scope is
  persisted; make sure the persisted scope still matches the engagement you're
  actively working on.
