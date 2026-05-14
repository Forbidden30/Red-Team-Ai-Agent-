# Kerberos misconfiguration (methodology)

These attacks exploit *misconfigurations*, not Kerberos itself. Each requires specific
domain conditions; the operator confirms those conditions before attempting the attack
on an authorized engagement.

## ASREP-roasting

- **Condition:** target user account has `DONT_REQ_PREAUTH` (`UF_DONT_REQUIRE_PREAUTH`)
  in `userAccountControl`.
- **Outcome:** any unauthenticated requester can ask the KDC for an AS-REP for the user;
  the encrypted-with-user-NTLM-hash blob can be offline-cracked.
- **Tooling:** `GetNPUsers.py` (impacket), `Rubeus.exe asreproast`.
- **Detection:** Event 4768 on the DC with `Pre-Authentication Type = 0` is the canonical
  signature. Defender for Identity has an out-of-the-box rule.

## Kerberoasting

- **Condition:** target user account has `servicePrincipalName` set (i.e. a "service
  account").
- **Outcome:** any domain user can request a TGS for the service. The TGS is encrypted
  with the service account's NTLM hash → offline crack.
- **Tooling:** `GetUserSPNs.py` (impacket), `Rubeus.exe kerberoast`.
- **Detection:** Event 4769 on the DC with `Ticket Encryption Type = 0x17` (RC4-HMAC) is
  the typical signature. Service accounts using AES-only mitigate; expiring the SPN
  removes the attack.

## Unconstrained delegation

- **Condition:** a computer or service has `TRUSTED_FOR_DELEGATION` set, AND a privileged
  user authenticates to it.
- **Outcome:** the host caches the privileged user's TGT in memory. An attacker with
  local admin on that host can extract the TGT and replay it.
- **Tooling:** Rubeus dump, mimikatz `sekurlsa::tickets`.
- **Detection:** unconstrained-delegation hosts should be tier-0 only. Detection is
  primarily *audit*: list hosts with the flag, confirm they're approved.

## Constrained / RBCD delegation

- **Constrained:** account configured with `msDS-AllowedToDelegateTo`. Can request
  tickets to the listed services as any user (with `protocol transition` flag).
- **Resource-Based Constrained Delegation (RBCD):** target machine account's
  `msDS-AllowedToActOnBehalfOfOtherIdentity` is writable by an attacker → attacker
  configures themselves as a delegating source and gets full control of the target.
- **Tooling:** Rubeus, impacket `getST.py`, `Set-ADUser`/`Set-ADComputer` for setting the
  attribute.

## Detection (general)

- Microsoft Defender for Identity covers most of these out-of-the-box.
- Sigma rules: `win_susp_kerberoast_rc4_encrypted_request`,
  `win_susp_asrep_roasting`, `win_unconstrained_delegation_change`.

## References

- ADSecurity — Kerberos attack guides
- SpecterOps — *Wagging the Dog* (RBCD)
- MITRE ATT&CK — T1558.003 (Kerberoasting), T1558.004 (AS-REP Roasting)
