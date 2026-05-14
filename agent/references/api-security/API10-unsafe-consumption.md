# API10:2023 — Unsafe Consumption of APIs

The target consumes a third-party API and trusts its responses too much.

## Examples

- Target calls a third-party "is-this-URL-safe?" service and acts on the result without
  verifying chain-of-custody. If the third party is compromised or spoofed, the target
  acts on attacker-controlled data.
- Target imports user data from a federation partner without re-validating shape /
  authorization / claims.
- Target follows redirects from an upstream API and ends up making requests to attacker
  hosts.

## Methodology

- Map the target's outbound dependencies. For each, ask: if this returns something
  unexpected (malformed, malicious, or controlled by an attacker who compromised the
  partner), what happens?
- Test: stand up a controlled upstream that returns crafted responses (mitmproxy at the
  target's egress, or temporarily DNS-rebind a test domain).

## Hardening

- Treat upstream responses as untrusted. Validate against the same schema as user input.
- Pin upstream certificates where stability allows. Otherwise, validate provider identity
  at the application layer.
- Don't follow redirects from upstream APIs without re-applying allowlist.

## References

- OWASP API10:2023
