# A01:2021 — Broken Access Control

The #1 web risk per OWASP. Authorization decisions made client-side, missing on the
server, or based on inputs the client controls.

## What to test for

- **IDOR (Insecure Direct Object Reference):** swap your own `id` for another user's `id`
  in URLs / JSON / hidden form fields. Test sequential IDs and UUIDs (sometimes
  predictable / leaked).
- **BOLA (API):** API endpoint accepts an object ID without checking ownership.
- **Force-browsing:** access `/admin/*` paths as a non-admin user. Often the JS bundle
  knows the routes — read it.
- **Method tampering:** `GET /resource/123` checks ACL; `POST /resource/123` doesn't.
  Try every verb on every endpoint.
- **Privilege elevation:** mass-assignment of `role`, `is_admin`, `tenant_id`. Try adding
  the field to JSON bodies and form-encoded POSTs.
- **Tenant isolation:** in multi-tenant apps, swap `tenant_id` / `org_id` / `workspace_id`
  in URLs and headers (often `X-Org-ID`).
- **JWT / token weaknesses:** tampered claims accepted? `alg: none`? Symmetric key
  guessable? See A07 too.

## Signals during testing

- 200 OK on resources that should 403 / 404.
- Resource ID swap returns the *other user's* data, not the placeholder.
- Admin endpoints behave differently for unauthenticated vs. authenticated low-priv
  (suggests auth is checked but not author*ization*).

## Detection / hardening

- Centralize authorization in middleware. Decisions never made in templates / clients.
- Deny by default; explicit grants.
- Log all authorization failures with user + resource + decision.

## References

- OWASP A01:2021 — Broken Access Control
- PortSwigger Web Security Academy — Access control
- OWASP Authorization Cheat Sheet
