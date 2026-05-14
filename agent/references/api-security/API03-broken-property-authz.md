# API3:2023 — Broken Object Property Level Authorization

The object access is OK; the property-level access is not. Two flavors:

- **Excessive data exposure:** API returns a property the caller shouldn't see
  (e.g. `password_hash` field in user-profile JSON).
- **Mass assignment:** API accepts a property the caller shouldn't set
  (e.g. setting `role: admin` in a PATCH body).

## Test for

- Read `GET /api/users/me` and `GET /api/users/<other>` — diff fields. Anything sensitive
  that leaks across?
- For each mutation endpoint (POST / PATCH / PUT), add fields not in the documented
  schema: `role`, `is_admin`, `email_verified`, `tenant_id`, `created_at`. Does the server
  silently accept any of them?
- GraphQL: introspection often reveals every field on every type. Try them.

## Hardening

- Explicit response DTOs (allowlist of fields), not "serialize the whole entity".
- Explicit request DTOs (allowlist of accepted fields).
- ORM-level "read-only" / "write-only" attributes for sensitive fields.

## References

- OWASP API3:2023
- PortSwigger — Mass assignment lab
