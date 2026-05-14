# API4:2023 — Unrestricted Resource Consumption

API operations that cost too much (compute, memory, money) without throttling.

## Test for

- Pagination limits. `?limit=999999` accepted?
- Search / filter with regex. `?name=^(a+)+$` (ReDoS).
- File-upload size limits. Large files trigger expensive transcoding.
- GraphQL query depth and complexity. Nested fragments expanding to enormous result sets.
- Operations that call paid third-party APIs (SMS, AI, image gen) without rate limit.

## Reporting nuance

- DoS proof should NOT actually DoS the target. Show the math: "a 5 KB query yields 80 MB
  response and 200 ms server time per request". Extrapolate impact in writing, don't
  demonstrate.
- For paid-third-party-API abuse, demonstrate one call and explain the bill multiplier.
  Don't run thousands.

## Hardening

- Per-endpoint and per-account rate limits.
- Cost-aware throttling (CPU time, DB query count, third-party API spend).
- Pagination caps. Query-depth caps for GraphQL.
- Backpressure / circuit-breaker on upstream expensive calls.

## References

- OWASP API4:2023
- Cloudflare blog — GraphQL query cost analysis
