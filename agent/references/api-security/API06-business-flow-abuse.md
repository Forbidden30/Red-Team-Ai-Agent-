# API6:2023 — Unrestricted Access to Sensitive Business Flows

Workflow abuse: each individual API call is authorized, but the *sequence* / *volume*
breaks the business model.

## Examples

- Coupon application replayed N times → infinite discount.
- Ticket-purchase flow used by a bot to corner inventory.
- Free-trial signup automated → infinite free trials.
- Account-recovery flow used as a username enumerator.

## Methodology

- Map the *intended* business flow. Identify the per-account / per-IP / per-device caps.
- Identify the state machine. Test transitions out of order.
- Test for idempotency keys. Replay the same call without one.

## Hardening

- Business-event-level rate limits (not just HTTP request limits).
- Device fingerprinting + behavioral signals (not just IP).
- Idempotency keys mandatory on state-changing operations.

## References

- OWASP API6:2023
- PortSwigger — Business logic vulnerabilities lab
