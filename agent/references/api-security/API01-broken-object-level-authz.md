# API1:2023 — Broken Object Level Authorization (BOLA)

API equivalent of IDOR. Endpoint exposes an object identifier and the server fails to
verify the caller's right to that object.

## Test for

- Swap `/api/users/<my-id>/...` for another user's ID. Test integer IDs, UUIDs (often
  predictable, leaked, or guessable), slugs.
- `tenant_id` / `org_id` / `workspace_id` swaps across tenants.
- Object IDs in JSON bodies, in headers (`X-Org-ID`), in path parameters, in query.
- Indirect references: a `share_token` issued for user A might be reusable for user B's
  resources.

## Signals

- 200 + different user's data returned.
- 200 + empty data with no auth error (auth-but-no-authz pattern).
- Error message that reveals the *existence* of the foreign object even though access is
  denied (oracle for enumeration).

## Hardening

- Authorization at the data-access layer, not the controller.
- Use scoped lookups: `db.user.findById(currentUser.id).orgs.findById(targetOrgId)` — not
  `db.org.findById(targetOrgId)` followed by a separate auth check.

## References

- OWASP API1:2023
- PortSwigger — Access control (API testing labs)
