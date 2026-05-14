# AD Certificate Services — common misconfigurations

Active Directory Certificate Services (AD CS) misconfigurations are documented in the
SpecterOps whitepaper *Certified Pre-Owned*. The "ESC1..ESC11" taxonomy is the canonical
reference; this file is a one-screen index for the operator.

## High-level taxonomy

| ID | Misconfig | Effect |
|----|-----------|--------|
| ESC1 | Template allows requester to specify SubjectAltName, low-privilege enroll | Auth as anyone |
| ESC2 | Template grants Any Purpose EKU + enroll | Use cert for client auth |
| ESC3 | Enrollment-agent template usable to request on others' behalf | Auth as anyone |
| ESC4 | Template ACL writable by low-priv → reconfigure to ESC1 | Auth as anyone |
| ESC5 | PKI object ACL writable by low-priv | Modify trust chain |
| ESC6 | CA flag `EDITF_ATTRIBUTESUBJECTALTNAME2` enabled | Same as ESC1 without template misconfig |
| ESC7 | CA security: low-priv has Manage CA → grant self enroll | Privilege escalation |
| ESC8 | NTLM relay to web-enrollment endpoint (HTTP not HTTPS, no EPA) | Domain takeover from any auth |
| ESC9..11 | More relay / cert-mapping variants | Various |

## Methodology

- **Enumerate** with `Certify.exe find` or `certipy find` (Linux-friendly). Outputs all
  templates + CA settings + ACL info.
- **Triage** by ESC ID. Operator picks the lowest-noise path.
- **Exploit** with `Certify.exe request` / `certipy req`. Output is a `.pfx`.
- **Use** with `Rubeus.exe asktgt /certificate:...` to get a TGT, or via
  `gettgtpkinit.py` (impacket).

## Detection

- Event 4886/4887 on the CA: cert request / issued. SAN content + requester mismatch is
  the smoking gun.
- Defender for Identity has ADCS rules in newer rule sets.
- Monitor changes to template ACLs and CA configuration.

## References

- *Certified Pre-Owned* (Will Schroeder, Lee Christensen — SpecterOps)
- certipy + Certify tool docs
- ADCS hardening guidance (vendor-neutral): require Manager Approval, ban
  SAN-from-requester, prefer HTTPS+EPA on web enrollment
