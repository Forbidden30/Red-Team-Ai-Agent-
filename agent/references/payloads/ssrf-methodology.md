# SSRF — methodology

See also [vuln-checklists/A10-ssrf.md](../vuln-checklists/A10-ssrf.md).

## Quick triage

1. **Find the URL parameter.** `?url=`, `?image=`, `?webhook=`, `?source=`, `?file=`,
   `?callback=`. Also JSON body fields and webhook configs.
2. **Probe with a controlled host.** Use Burp Collaborator, interactsh, or a dedicated
   listener. Confirm outbound TCP/DNS.
3. **Test the cloud metadata endpoints.**
   - AWS IMDSv2: `169.254.169.254/latest/meta-data/iam/security-credentials/<role>`
   - GCP: `metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token`
     (Header: `Metadata-Flavor: Google`)
   - Azure: `169.254.169.254/metadata/instance?api-version=2021-02-01`
     (Header: `Metadata: true`)
4. **Test internal services.** `localhost:80`, `localhost:6379` (Redis), `localhost:9200`
   (Elasticsearch), `localhost:8500` (Consul), `localhost:8161` (ActiveMQ).
5. **Escalate from blind to data-extracting.** If the response body isn't reflected,
   look for time-based / status-based oracles.

## Bypass tricks

- **DNS rebinding.** rbndr.us, lock.cmpxchg8b.com — for "validates URL, then re-resolves
  before fetching" patterns.
- **Open redirect chains.** Allowlist accepts trusted-host.com, but trusted-host.com has
  an open-redirect to attacker. Chain.
- **URL parsers vs HTTP libraries disagree.** `http://allowed.com#@attacker.com` — Python
  urllib parses differently than node-fetch.
- **Protocol smuggling.** `gopher://` to talk Redis / SMTP; `dict://`; `file://`;
  `php://filter` for PHP.
- **IPv6.** `[::1]`, `[::ffff:127.0.0.1]`, IPv6 representations bypass IPv4 blocklists.
- **Decimal IP.** `2130706433` = `127.0.0.1`.
- **0-prefix.** `0.0.0.0` or `0/0` route to localhost on Linux.

## Hardening (write this in the report)

- Allowlist destinations at the application layer. Resolve server-side, validate IP is
  in allowlist, then connect to the IP (defeats rebinding).
- Block link-local / loopback / RFC1918 ranges at the egress firewall.
- IMDSv2 with hop limit 1 (AWS).
- Disable URL-protocol handlers not needed.
- For webhook flows, sign the outbound request so the receiver knows it's authentic;
  doesn't fix SSRF but limits abuse.

## References

- Orange Tsai — *A new era of SSRF* (BlackHat USA 2017).
- PortSwigger — SSRF labs.
- HackTricks — SSRF cheat sheet.
