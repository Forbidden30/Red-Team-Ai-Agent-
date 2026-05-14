---
name: enumerate
description: Surface enumeration for a specific in-scope host.
---

Usage: `/enumerate <host>`

Pre-checks `<host>` against `scope.json.authorized_targets`. Refuses if not in scope.

Then runs:
- Web content discovery (ffuf with stack-appropriate wordlist)
- Parameter discovery (Arjun for HTTP, ParamSpider on wayback corpus)
- JS analysis (LinkFinder / katana headless render)
- Endpoint extraction → `intel.md`

Detection-aware: defaults to `-rate 30` and `--threads 5`.
