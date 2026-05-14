---
name: vuln-analyze
description: Dispatch vulnerability-analyst on a captured candidate finding.
---

Usage: `/vuln-analyze <candidate-file-or-id>`

The candidate must be an artifact in the engagement (a captured request/response, a
source-analyzer finding card, etc.).

The vulnerability-analyst will produce a structured triage:
- class (e.g. SSRF, IDOR, SQL injection)
- evidence reference
- CVSS 3.1 vector + score (each metric justified)
- VRT classification (P1-P5 + category)
- impact (asset-contextual)
- recommended fix
- references (NVD / GHSA / OWASP)

Output saved as `findings/F-<NN>-<short-name>.md`.
