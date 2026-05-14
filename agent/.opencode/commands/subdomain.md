---
name: subdomain
description: Passive subdomain enumeration for a root domain.
---

Usage: `/subdomain <root-domain>`

Sources (passive only, no resolves):
- crt.sh
- Subfinder (passive providers configured)
- Amass intel (passive)
- Wayback CDX
- GitHub code search via `gh search code "<root-domain>" --limit 100`

Output:
- `artifacts/subdomains-<root>-<ISO>.txt` (deduped, sorted)
- Appends new hosts to `intel.md` under `## hosts`

This command does **not** resolve or probe. Resolution + probing is `/scan`.
