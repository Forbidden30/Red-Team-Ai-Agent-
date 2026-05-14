# References

Methodology, checklist, and tool references that sub-agents consult during an engagement.
The reference set is intentionally focused on *methodology and standard practice* — not
on weaponized payload libraries. The agents have judgement; the references give them
shared vocabulary.

## Layout

```
references/
├── INDEX.md                                 # this file
├── handoff-protocols.md                     # sub-agent handoff contract
├── wildcard-mode.md                         # rules for bug-bounty wildcard scope
├── vuln-checklists/                         # OWASP Top 10 (Web)
│   ├── A01-broken-access-control.md
│   ├── A02-cryptographic-failures.md
│   ├── A03-injection.md
│   ├── A04-insecure-design.md
│   ├── A05-security-misconfiguration.md
│   ├── A06-vulnerable-components.md
│   ├── A07-authentication-failures.md
│   ├── A08-data-integrity-failures.md
│   ├── A09-logging-failures.md
│   └── A10-ssrf.md
├── api-security/                            # OWASP API Security Top 10
│   ├── API01-broken-object-level-authz.md
│   ├── API02-broken-authentication.md
│   ├── API03-broken-property-authz.md
│   ├── API04-resource-consumption.md
│   ├── API05-broken-function-authz.md
│   ├── API06-business-flow-abuse.md
│   ├── API07-ssrf.md
│   ├── API08-security-misconfiguration.md
│   ├── API09-improper-inventory.md
│   └── API10-unsafe-consumption.md
├── active-directory/                        # AD methodology (advisory)
│   ├── ad-enumeration.md
│   ├── kerberos-attacks.md
│   └── adcs-attacks.md
└── tools/                                   # Tool cheatsheets
    └── recon/
        ├── nmap.md
        ├── nuclei.md
        ├── ffuf.md
        ├── httpx.md
        ├── subfinder.md
        └── amass.md
```

## How sub-agents use references

Sub-agents are pre-loaded with the relevant references for their domain (the operator
selects). They cite the reference file (e.g. `[ref: vuln-checklists/A03-injection.md]`)
when applying a methodology step. The operator can audit reasoning by reading the cited
reference.

## Updating references

Pull requests welcome. Keep entries:
- Concise. Methodology + key signals, not payload encyclopedias.
- Cited. Link OWASP / PortSwigger / HackTricks / vendor docs for canonical references.
- Defensive-friendly. Each offensive technique should pair with a detection / hardening hint.
