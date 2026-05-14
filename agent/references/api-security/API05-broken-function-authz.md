# API5:2023 — Broken Function Level Authorization

Endpoint-level authz is missing or inconsistent. Different HTTP method, different
endpoint version, different sub-resource → different (or no) auth check.

## Test for

- `DELETE /api/resource/123` allowed where only `GET` was permitted.
- `/api/v1/admin/...` reachable for non-admins; `/api/v2/admin/...` correctly blocks.
- Internal endpoints exposed: `/api/internal/...`, `/api/debug/...`.
- Method override: `POST` with `X-HTTP-Method-Override: DELETE` reaching a DELETE handler
  that has different auth.

## Hardening

- Centralize authorization in middleware keyed on endpoint + method.
- Default-deny for new endpoints (require explicit allow-roles annotation).
- Remove internal / debug endpoints from production builds entirely.

## References

- OWASP API5:2023
