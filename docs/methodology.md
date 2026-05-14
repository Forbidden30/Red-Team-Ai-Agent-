# Methodology

How an engagement runs end-to-end with this tool.

## Phase 0 — Authorization

Before anything else, capture:

- **Statement of Work / Letter of Authorization** (PDF, signed). Keep a copy locally.
- **In-scope targets** (hostnames, IP ranges, applications).
- **Out-of-scope rules** (production payment domain, partner SaaS, etc.).
- **Rules of engagement** (noise budget, data-exfil allowed?, lateral movement allowed?,
  hours of operation, point-of-contact for emergencies).

In the orchestrator, click **Define scope** and fill in the form. In the CLI, run
`/auth` and create `agent/engagements/<name>/scope.json`.

If you can't show paperwork for the engagement, don't run the tool against the target.

## Phase 1 — Reconnaissance

**Goal:** map the attack surface.

1. **Passive subdomain enumeration.** crt.sh + subfinder + Wayback CDX + GitHub code
   search.
2. **DNS, ASN, certificate mapping.** Identify the org's IP allocations and CDN/cloud
   posture.
3. **Active host discovery (in-scope only).** `nmap -sn -PE -PP -PS22,80,443` against
   the in-scope ranges.
4. **Service enumeration.** nmap top-1000 with `-sV -sC -T3` against discovered hosts.
5. **Web tech fingerprint.** httpx with `-tech-detect`, manual JS bundle peek.
6. **Append everything to `intel.md`.**

Sub-agent: `recon-specialist`. References: `agent/references/tools/recon/`.

## Phase 2 — Collect

**Goal:** pull artifacts you can analyze offline.

- **Source code** (if grey-box / white-box engagement).
- **JS bundles** for web apps. Look for sourcemaps.
- **Mobile binaries** (APK / IPA) — `apktool`, `jadx`, `MobSF`.
- **API schemas** — Swagger / OpenAPI, GraphQL introspection.
- **Container images** — `dive`, `trivy`, `syft` for SBOM.
- **Configuration** — IaC (Terraform, CloudFormation), CI/CD pipeline definitions.

Sub-agent: `source-analyzer`.

## Phase 3 — Test

**Goal:** identify candidate vulnerabilities.

For each in-scope asset, work through the OWASP Top 10 and (for APIs) API Top 10
references in `agent/references/`. For each finding candidate, build a case in the
queue.

Sub-agents: `vulnerability-analyst` (triage), `fuzzer` (when input handling is
interesting).

## Phase 4 — Exploit + OSINT

**Goal:** prove impact for each validated finding.

- `exploit-developer` constructs a minimal proof-of-impact for each finding. PoCs are
  single-shot demonstrations on the agreed asset, NOT mass-deployable weaponization.
- `osint-analyst` enriches each finding with breach / infra / leak context where it
  strengthens the report (e.g. "this leaked credential matches the HIBP entry from
  the 2023 vendor breach").

## Phase 5 — Report

**Goal:** deliver the engagement's value.

- `report-writer` drafts:
  - One finding file per vulnerability (`findings/F-NN-<slug>.md`).
  - Executive summary (3-5 sentences, business language).
  - Remediation backlog (engineering-ready, prioritized).
- The operator reviews each claim against the engagement's evidence files.
- `agent/scripts/finalize_engagement.sh <engagement>` bundles the final report.

## After delivery

- Vendor / authorizer triages the report.
- Operator answers clarifying questions.
- For each finding, expect either acceptance + fix (most common), partial acceptance
  with reduced severity, or wontfix with rationale.

Track retest schedule. Re-run `/confirm F-NN` against the fixed version to verify
remediation is real.
