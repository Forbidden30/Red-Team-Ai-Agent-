---
name: recon
description: Dispatch the recon-specialist for the current engagement.
---

Switches the active agent to `recon-specialist` (see `prompts/agents/recon-specialist.txt`)
and runs an external recon pass against the in-scope targets in `scope.json`.

Stages:
1. Passive subdomain enumeration (crt.sh, Subfinder passive, Wayback CDX).
2. DNS + ASN + cert mapping.
3. Active probe of resolved hosts (httpx, nmap top-1000 with `-T3 -sV`).
4. Tech fingerprint (whatweb, manual JS bundle peek).
5. Append `intel-deltas` to `intel.md`.

The recon-specialist returns ranked followups. Operator picks the next call.
