---
name: autoengage
description: Run the full Recon → Collect → Test → Exploit+OSINT → Report pipeline.
---

Usage: `/autoengage`

Requires:
- `agent/engagements/<active>/scope.json` (otherwise refuse)
- `ANTHROPIC_API_KEY` set

Behavior:
1. Operator confirms scope summary, then dispatches `recon-specialist`.
2. After each phase, summarize deltas and ask the human operator to approve continuing.
3. Each phase emits artifacts under `agent/engagements/<active>/`:
   - recon → `intel.md` deltas
   - collect → `artifacts/` (source / JS bundles / API specs)
   - test → `findings/` (one MD per finding-candidate)
   - exploit → per-finding `proof-of-impact.md`
   - report → `reports/exec-summary.md`, `reports/findings-report.md`

Hard stop conditions: any sub-agent reports `confidence: low` on a finding, a sub-agent
hits an out-of-scope target, or the operator presses Ctrl+C.

This is **operator-assisted**, not autonomous. The human approves each phase transition.
