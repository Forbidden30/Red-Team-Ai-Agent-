# Active Directory — Enumeration (methodology)

This reference assumes an **authorized internal engagement** with low-privilege domain
credentials. The objective is to map the AD environment safely and identify privilege
escalation paths.

## Tools

- **BloodHound (community / legacy ingestors):** the canonical AD graph tool. Collection
  methods range from low-noise (LDAP queries only) to higher-noise (SMB/RPC). Pick the
  collection method that matches your noise budget — see BloodHound docs for the
  CollectionMethod flag matrix.
- **ldapsearch / pwsh / PowerShell ActiveDirectory module:** raw queries when BH isn't
  available or you need a specific attribute.
- **adidnsdump:** AD-integrated DNS enumeration over LDAP (often readable by any user).

## What to collect

- Users (with attributes: `userAccountControl` flags, `servicePrincipalName`,
  `pwdLastSet`, `lastLogon`).
- Groups (membership graph). Note nested groups.
- Computers (OS version, SPNs, delegation flags).
- GPOs (linked OUs, settings).
- ACL / ACE: who can do what to whom. The most interesting privilege paths often hide
  here, not in group membership.
- Trusts (to other domains / forests).

## Where to look first

1. Find accounts with `DONT_REQ_PREAUTH` set → ASREP-roastable.
2. Find user accounts with `servicePrincipalName` populated → Kerberoastable.
3. Find computers with `TRUSTED_FOR_DELEGATION` (unconstrained delegation) →
   if any high-privilege user authenticates to them, ticket capture.
4. Find ACLs granting `GenericAll` / `GenericWrite` / `WriteDACL` / `WriteOwner` to
   non-tier-0 principals on tier-0 objects.
5. Find sessions of privileged users on machines that low-priv users can compromise
   (BloodHound's *Find Shortest Paths from Owned Principals to Domain Admins*).

## Noise / detection

- BloodHound's SMB collection method touches every workstation. Generates a lot of
  4624/4625 events. Use `--CollectionMethod LoggedOn` only when you need session data
  *and* the engagement permits the noise.
- Repeated LDAP queries from one workstation are visible to defenders running Microsoft
  ATA / Defender for Identity. Spread the queries over time, or run them from a host
  closer to the DC if your foothold permits.

## References

- BloodHound docs (Specter Ops)
- AD Security cheat sheet — adsecurity.org
- HackTricks — Active Directory Methodology
