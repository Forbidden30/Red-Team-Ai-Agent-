# Hardening checklist

Pair every finding with a remediation. This file is a fast index, not a complete CIS
benchmark — use it during report-writing to suggest concrete fixes.

## Linux server

- [ ] No SSH password auth. Public key only. `PasswordAuthentication no`, `PermitRootLogin no`.
- [ ] Unattended-upgrades enabled for security packages.
- [ ] Firewall enforcing default-deny inbound. ufw / nftables / cloud-SG.
- [ ] AppArmor or SELinux in enforcing mode for at least the web/app processes.
- [ ] No unnecessary listeners on 0.0.0.0 (`ss -tlnp`).
- [ ] Audit logging on (auditd) for sudoers / setuid changes.
- [ ] Sudo rules audited; `NOPASSWD` only for specific narrow commands.
- [ ] Filesystem mount options: `/tmp` `nosuid,noexec,nodev`; `/var/log` separate mount.

## Windows server

- [ ] LAPS for local admin password rotation.
- [ ] Constrained delegation tier-0 only; document each `TRUSTED_FOR_DELEGATION` host.
- [ ] LSA Protection (`RunAsPPL`) enabled.
- [ ] Credential Guard enabled.
- [ ] AppLocker / WDAC policies enforced.
- [ ] PowerShell ScriptBlockLogging + ModuleLogging + Transcription enabled.
- [ ] SMBv1 disabled.
- [ ] Service accounts have minimal SPN footprint; AES-only Kerberos where possible.

## Web application

- [ ] CSP that's actually restrictive (no `unsafe-inline`, allowlisted script-src).
- [ ] HSTS with preload (if eligible).
- [ ] Secure / HttpOnly / SameSite cookies.
- [ ] CORS allowlist explicit, no reflective `Access-Control-Allow-Origin`.
- [ ] CSRF protection on every state-changing endpoint.
- [ ] Authorization at data-access layer, not just the controller.
- [ ] Input validation at the boundary; output encoding by context.
- [ ] Server fingerprint headers stripped (`Server`, `X-Powered-By`).
- [ ] Error handler with safe fallback (no stack traces to client).
- [ ] Rate limits per account, per IP, per endpoint type.

## Cloud (AWS-ish, generalizes)

- [ ] No public S3 buckets by default. Block-public-access at account level.
- [ ] IAM least privilege; no `Action: *` policies on non-admin roles.
- [ ] Root account has MFA + no keys. Use IAM users / IAM Identity Center.
- [ ] CloudTrail enabled in all regions with immutable storage.
- [ ] GuardDuty + Security Hub in audit org.
- [ ] IMDSv2 enforced (hop limit 1) on EC2.
- [ ] Secrets in AWS Secrets Manager / Parameter Store; never env vars in user-data.

## API

- [ ] AuthN on every endpoint (no implicit "internal API trusts").
- [ ] AuthZ scoped — object-level (BOLA) + property-level (excessive data exposure).
- [ ] Rate limits cost-aware (CPU, third-party API spend).
- [ ] Pagination caps, GraphQL query-depth caps.
- [ ] Old API versions sunset with traffic monitoring.
- [ ] Secrets / tokens never logged.

## Build / supply chain

- [ ] Lockfiles checked in, lockfile-driven CVE scanning in CI (osv-scanner / Snyk).
- [ ] Base images and 3rd-party actions pinned to commit SHA / sha256.
- [ ] Signed releases (Sigstore / cosign).
- [ ] SBOM generation in CI.
- [ ] Dependabot / Renovate for security upgrades.

Pair findings with the specific entries above. Don't dump the whole list in a report.
