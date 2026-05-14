# A10:2021 — Server-Side Request Forgery (SSRF)

Server-side code makes a request whose destination is influenced by the user.

## Surfaces

- URL parameters: `?url=`, `?image_url=`, `?webhook=`, `?callback=`, `?proxy_pass=`.
- File-fetch features: profile picture from URL, RSS feed importer, PDF-from-URL.
- Webhook configuration: outbound HTTP to user-supplied target.
- XML parsing (XXE → SSRF via external entity).
- DNS-based: short-lived rebinding from a domain the attacker controls.

## What to check

- **Cloud metadata.** AWS `169.254.169.254/latest/meta-data/`,
  GCP `metadata.google.internal/computeMetadata/v1/`, Azure `169.254.169.254/metadata/`.
  IMDSv2 makes AWS metadata harder but not always enforced.
- **Internal services.** `localhost:6379` (Redis), `localhost:9200` (Elasticsearch),
  `localhost:8500` (Consul). Often unauthenticated.
- **DNS rebinding.** If the target resolves the URL once then fetches it later, rebind
  the DNS between checks (rbndr.us, lock.cmpxchg8b.com/rebinder.html).
- **Redirect-following.** If the URL passes a check but the server then follows a 302,
  craft a controlled 302 from a vetted host to the real target. Open redirects on the
  same-org list are a classic chain.
- **Protocol smuggling.** `gopher://`, `dict://`, `file://`. PHP wrappers
  (`php://filter`, `data://`).

## Hardening

- Allowlist destinations, not blocklist (blocklists miss DNS rebinding and edge cases).
- Resolve the hostname *server-side*, validate IP is in allowlist, then make the request
  to the *IP* (not the hostname) — defeats rebinding.
- Block link-local / RFC1918 / loopback at the application level, not just network level.
- Use IMDSv2 with hop limit 1.
- Disable URL-protocol handlers not needed (everything except http/https).

## References

- OWASP A10:2021
- PortSwigger — SSRF lab
- Orange Tsai — *A New Era of SSRF* (BlackHat USA 2017)
