# A04:2021 — Insecure Design

Bugs that aren't implementation errors — the design itself is the vuln. Logic flaws,
threat-modeling gaps, missing trust boundaries.

## Examples

- **Coupon stacking:** discount logic allows applying the same coupon N times.
- **Race conditions on workflow state.** Order can be "approved" before "paid".
- **Stateless rate limits.** Each new IP gets a fresh quota → infinite retries.
- **Trust on first use without confirmation.** First device added to an account inherits
  full trust.
- **Authorization tied to UI state instead of server state.** "If the user can see the
  button, they can do the thing."
- **Recovery flows weaker than primary auth.** "Forgot password" only requires email +
  SMS code, but the primary login has MFA.
- **Implicit trust between microservices.** Service A trusts anything Service B sends
  without verification — Service B is compromised → A is too.

## Methodology

- Map the *intended* state machine of the feature you're testing.
- Look for transitions that the design assumes can't happen but the implementation allows
  (race conditions, replay, out-of-order requests).
- Map the trust boundaries: where does data cross from "untrusted" to "trusted"? Is the
  check at the boundary or further in?

## Hardening

- Threat-model at feature design time (STRIDE / attack trees).
- Server-side state authority. UI is a view, not the truth.
- Per-feature rate limits + abuse-detection signals.
- Multi-step state transitions guarded by idempotency keys + state-machine validation.

## References

- OWASP A04:2021
- OWASP Threat Modeling Cheat Sheet
- PortSwigger — Business logic vulnerabilities lab
