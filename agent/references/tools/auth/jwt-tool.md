# jwt_tool — usage notes

Analyze and exploit JWT tokens.

## Common operations

```bash
# Decode + inspect
jwt_tool eyJhbG...

# Test for common JWT vulnerabilities
jwt_tool -t https://target/api -M at -rh "Authorization: Bearer eyJ..." -p eyJ...

# alg:none attack
jwt_tool eyJ... -X a

# Weak HMAC key crack
jwt_tool eyJ... -C -d /usr/share/wordlists/jwt-secrets.txt

# kid header injection
jwt_tool eyJ... -X k -p eyJ...
```

## Manual checklist

1. **Algorithm.** `alg: none`? `alg: HS256` with a key you can guess? Algorithm
   confusion (HS256 verified with the RS256 public key)?
2. **Signature verification.** Strip the signature — does the server accept?
3. **Claims.** `kid` header injection, JWK header injection (`jku`, `x5u`).
4. **Expiration.** `exp` missing or far in the future? Refresh tokens that don't rotate?
5. **Audience.** `aud` claim verified? Token issued for service A accepted by service B?

## Hardening (write in the report)

- Use vetted libraries (no custom JWT parsing).
- Don't allow `alg: none` ever; pin the algorithm in code, don't read from the token header.
- Short access-token lifetime (5-15 min), rotating refresh tokens with revocation.
- Strict `aud` + `iss` validation.
- Don't trust `kid` to fetch keys without an allowlist.

## References

- github.com/ticarpi/jwt_tool
- PortSwigger — JWT attacks labs
- OWASP JWT Cheat Sheet
