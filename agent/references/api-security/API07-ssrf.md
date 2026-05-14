# API7:2023 — Server-Side Request Forgery

See [vuln-checklists/A10-ssrf.md](../vuln-checklists/A10-ssrf.md) — same surface, applied
to APIs.

Common API SSRF entry points:

- `?url=` parameters on import / webhook / share / preview endpoints.
- File-fetch fields in JSON bodies (image_url, avatar_url, source_url).
- Webhook config endpoints that the user controls and the server validates by sending a
  test ping.
- XML-accepting endpoints (XXE → SSRF).

API-specific hardening:

- Allowlist outbound destinations at the egress firewall layer.
- For webhook ping flows, resolve hostname server-side once, validate IP, then connect
  to the IP — defeats DNS rebinding.
