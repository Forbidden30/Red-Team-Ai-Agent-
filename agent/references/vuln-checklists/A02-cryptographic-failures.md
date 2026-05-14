# A02:2021 — Cryptographic Failures

What to look for on engagements where cryptography (or its absence) matters.

## Test for

- **Cleartext sensitive data.** Passwords / tokens / PII in URL query strings, in logs,
  in cookies without `Secure`, in non-HTTPS endpoints.
- **Weak primitives.** MD5 / SHA1 for password hashing or signature verification. DES,
  RC4. ECB-mode block ciphers. Custom-rolled crypto.
- **Static / weak keys.** Hardcoded in source, in JS bundles, in mobile app strings, in
  default config that the operator forgot to change.
- **Bad randomness.** `Math.random()` for tokens / session IDs / OTPs. `mt_rand` in PHP.
  `rand()` in C. Predictable IVs.
- **Bad TLS posture.** Old protocol versions, weak cipher suites, missing HSTS, no
  certificate pinning on mobile.
- **Sensitive data at rest.** Tokens stored verbatim in DB instead of hashed. Backup
  files left in web-accessible paths.

## Signals

- Token / session cookie that's short (e.g. 8 chars), incrementing, or base64 of a
  predictable value.
- Login flow returns the password hash to the client (rare but happens).
- Mobile app pins certificate but ignores chain (one-line bypass).

## Hardening

- Use vetted libraries (bcrypt / argon2id, libsodium, AES-GCM). Don't roll your own.
- Crypto agility: `kid` / version field in tokens so rotation is possible.
- HSTS + preload, secure cookies (HttpOnly + Secure + SameSite).

## References

- OWASP A02:2021
- OWASP Cryptographic Storage / Transport Layer Cheat Sheets
- NIST SP 800-131A (algorithms / key sizes)
