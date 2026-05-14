# A09:2021 — Security Logging and Monitoring Failures

Engagement value: this class is rarely a P1 finding on its own but is critical for
**detection in the report**. Pair every offensive finding with a "what was logged"
note for the blue-team backlog.

## What to assess (on a grey-box engagement)

- Are authentication successes / failures logged with timestamp + source IP + user?
- Are authorization denials logged? Most apps log auth events but not authorization.
- Are admin actions logged with the *acting user*, not the system user?
- Are logs centralized (SIEM)? Or only on the host that may be compromised?
- Are logs immutable or append-only? Can the user-level service account delete them?
- Are alert thresholds reasonable, or does the team get alert-fatigue?
- Is there a runbook for the alerts that do fire?

## Common gaps

- Login attempt logging exists but is sampled at 1/N.
- Failed-MFA isn't logged.
- API access logs missing `actor` field (just `client_ip`).
- Backup retention shorter than typical attacker dwell time.

## Hardening

- Centralize. Make local-log-tampering not enough to hide.
- Define key events explicitly (auth success/fail, MFA success/fail, role change,
  privileged action, data export above threshold).
- Pair detection rules with runbooks.

## References

- OWASP A09:2021
- OWASP Logging Cheat Sheet
- MITRE ATT&CK — DS0015 (Application Log)
