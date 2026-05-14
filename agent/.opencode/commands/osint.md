---
name: osint
description: Dispatch the osint-analyst for passive intelligence enrichment.
---

Switches to `osint-analyst`. No traffic to target-owned infrastructure.

Default flow:
1. From `intel.md`, take known domains / orgs / employees.
2. Enrich each via certificate transparency, archive.org, GitHub code search, public breach
   indexes (HIBP / Dehashed where licensed), BGP/ASN lookups.
3. Cross-correlate sources. Confirm with at least two independent sources before reporting.
4. Append `enrichments` to `intel.md` and `potential-out-of-scope` to `followups`.

Useful when the engagement has hit a recon wall and needs new asset candidates.
