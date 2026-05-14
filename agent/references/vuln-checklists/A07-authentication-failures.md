# A07:2021 — Identification and Authentication Failures

Auth bugs proper — login, session, MFA, password reset.

## Test for

- **Username enumeration.** Different response time / message / status for valid vs.
  invalid usernames at login / signup / reset.
- **Password policy.** Min length, complexity, breached-password check (HIBP API).
- **Credential stuffing resistance.** Rate limit, CAPTCHA, breached-password block.
- **MFA bypass.** Skip-MFA via session reuse, MFA disable via "remember device" without
  re-auth, MFA missing on password-reset flows, MFA missing on API tokens.
- **Session fixation.** Session ID stays the same across login.
- **JWT issues.** `alg: none`, `kid` injection, weak HMAC key, JWK header injection,
  missing `exp`, missing audience check.
- **OAuth misconfig.** Open redirect on `redirect_uri`, missing PKCE, `state` not checked,
  implicit flow used where authorization-code-with-PKCE is required, scope upgrade via
  re-consent.
- **Password reset weaknesses.** Predictable tokens, tokens that don't expire, tokens
  that work for any account.
- **Logout that doesn't invalidate.** Session ID still works after logout.

## Methodology

- Manual login flow review (Burp / Caido). Look at every state transition.
- Token analysis: paste JWTs into jwt.io, check claims. For opaque sessions: length,
  entropy, predictability.
- OAuth: walk the full flow, swap parameters, replay codes.

## Hardening

- Short-lived tokens, refresh tokens with rotation + revocation.
- MFA on all auth flows, including reset and API token generation.
- Strict CSRF / state / PKCE / nonce checks in OAuth.
- Login alerts for new devices / locations.

## References

- OWASP A07:2021
- OWASP Authentication / Session Management Cheat Sheets
- IETF RFC 7519 (JWT), RFC 6749 / 6750 (OAuth 2)
