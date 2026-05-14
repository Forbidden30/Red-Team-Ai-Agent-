# API2:2023 — Broken Authentication

Same as web A07 but skewed toward how APIs auth: bearer tokens, API keys, JWT, OAuth,
mutual TLS.

## Test for

- API key in URL query (logged everywhere).
- Long-lived bearer tokens with no rotation, no revocation, no MFA at issue time.
- JWT pitfalls: `alg: none`, weak HMAC key, missing `aud` / `iss` / `exp`, missing
  signature verification, `kid` header injection.
- OAuth flows: missing PKCE, missing `state`, `redirect_uri` open redirect, implicit
  flow where authcode-with-PKCE is required.
- Service-account tokens shared across services.

## Hardening

- Short-lived access tokens + rotating refresh tokens with revocation.
- MFA required at token issuance for human users.
- Service-account tokens scoped per-service, audited.
- API keys: hash at rest, audit on use, scope per integration.

## References

- OWASP API2:2023
- OAuth 2 Security BCP (RFC 8252)
