---
name: report
description: Generate engagement report artifacts.
---

Dispatches `report-writer`. Produces:

- `reports/findings-report.md` — full technical writeup, one section per finding.
- `reports/exec-summary.md` — 3-5 sentence executive summary.
- `reports/remediation-backlog.md` — engineering-ready remediation list with priority,
  effort estimate, owner team, acceptance criteria.

Pre-conditions:
- At least one finding under `findings/`.
- Each finding has a `proof-of-impact.md` (or an explicit "informational" tag).

Report-writer refuses any claim not backed by an artifact in the engagement directory.
