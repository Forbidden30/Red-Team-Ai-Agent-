# Security Policy

## Reporting a vulnerability in this project

If you find a security issue in the **Red Team AI Agent** codebase itself (the
orchestrator, the agent prompts, the scripts), please report it privately:

1. Open a private security advisory on this repository's GitHub Security tab
   (preferred), or
2. Email the maintainer listed in the repository profile.

Please do not open public issues for security defects.

### What we consider in-scope for reports

- Vulnerabilities in the orchestrator's HTTP API (`/api/chat`) — auth bypass,
  injection, SSRF, RCE, etc.
- Issues that allow the scope-check / authorization gate to be bypassed in unintended
  ways (e.g. an attacker getting the orchestrator to act on an out-of-scope host
  without operator approval).
- Sensitive-information disclosure (API keys, credentials, scope.json contents).
- Supply-chain or build-pipeline issues in this repository.

### What we consider out-of-scope

- Reports that this tool can be used to attack systems. That is its purpose; the
  guardrails are the user's responsibility, the legal framework's responsibility, and
  the law's responsibility — not technical impossibilities baked into the code.
- Theoretical Anthropic-API-side issues that should be reported to Anthropic instead.

## Responsible use

This tool is intended for use against systems for which the user has written
authorization. Misuse is solely the user's responsibility. See [LICENSE](./LICENSE).

If you discover this tool being used against systems without authorization, please
report it to the system owner and to the appropriate authorities; we cannot mediate
those situations.
