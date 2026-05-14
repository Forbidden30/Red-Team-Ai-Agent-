# Contributing

Contributions welcome. Keep the project narrowly scoped — methodology copilot for
authorized engagements, not an autonomous attack tool.

## Areas that welcome contributions

- **References.** Methodology docs in `agent/references/`. Concise, cited, defense-aware.
- **Agent prompts.** Refinements to the eight agents in
  `agent/.opencode/prompts/agents/`. Focus on judgement-improving instructions, not on
  expanding offensive capability.
- **Orchestrator UX.** Web-UI improvements — phase visualizations, scope management,
  report export, finding timeline.
- **Scripts.** Engagement-management helpers in `agent/scripts/`. Bash + jq + sqlite3.
- **Docker images.** Slimmer toolbox images, supply-chain-pinned base images.

## Areas that won't be accepted

- AV / EDR evasion payloads or weaponization.
- Mass-target scanning automation (this tool is per-engagement by design).
- C2 framework integrations.
- Phishing macro / dropper templates.
- "Autonomous attack" features that take operator approval out of the loop.

## Pull request checklist

- [ ] Methodology, not weaponization.
- [ ] If the change adds an offensive capability, it pairs with a detection / hardening
      note.
- [ ] Cites OWASP / PortSwigger / HackTricks / vendor docs for technique references.
- [ ] No secrets, no engagement-specific data.
- [ ] `npm run build` succeeds in `orchestrator/`.
- [ ] `bash agent/scripts/hooks/scope-check.sh "ls"` and similar smoke-checks succeed.

## Code style

- TypeScript strict mode in `orchestrator/`.
- Bash + `set -euo pipefail` in `agent/scripts/`.
- Markdown in references: short paragraphs, link-rich, cite sources.
