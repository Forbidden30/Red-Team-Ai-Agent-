---
name: scan
description: Run a coordinated scanner pass against in-scope hosts.
---

Wraps:
- nmap service-version scan (`-sV -sC --top-ports 1000 -T3`)
- httpx web fingerprint
- nuclei templates (only `severity: high,critical` by default, manual opt-in for others)

Pre-conditions:
- Active engagement has scope.json
- Rate cap from `scope.json.rules_of_engagement.noise_budget`

Outputs:
- `artifacts/scan-<ISO>.txt` (raw)
- `intel.md` summary appended

Refuses to run if the target list resolves to anything outside `authorized_targets`.
