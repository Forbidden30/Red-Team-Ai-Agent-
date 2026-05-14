---
name: proxy
description: Stand up a recording proxy for traffic capture.
---

Starts `mitmproxy` in headless mode with the engagement-aware addon at
`agent/scripts/proxy_addon.py`. The addon:

- Tags flows with the active engagement name.
- Stores raw flows under `artifacts/proxy/<ISO>.mitm`.
- Strips request/response bodies that don't match in-scope hosts.
- Refuses to proxy any host not in `scope.json.authorized_targets`.

Useful for manual testing in Burp / Caido alongside automated work.
