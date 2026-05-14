# API9:2023 — Improper Inventory Management

The org doesn't know what APIs they have. Old versions, internal-only routes accidentally
public, deprecated endpoints still running.

## Surfaces

- `/api/v1/...` deprecated but still alive next to `/api/v2/...`. v1 has bugs that v2
  patched.
- `/api-internal/...` exposed externally because of a load-balancer misroute.
- Forgotten staging API at `api-staging.example.com` with prod data and weaker auth.
- Old versions still in mobile apps but the server has moved on — the old endpoints exist
  as a compatibility shim and are less audited.

## Methodology

- Compare endpoints across observed versions. Diff v1/v2 surface.
- Crawl JS bundles for endpoint strings — they reveal versions and internal routes.
- DNS subdomain enum often surfaces forgotten staging / dev / qa hosts.

## Hardening

- API inventory as code. Every endpoint registered, owned, monitored.
- Sunset old versions with traffic monitoring + deletion plan.
- Public vs. internal routing enforced at the gateway, not the application.

## References

- OWASP API9:2023
