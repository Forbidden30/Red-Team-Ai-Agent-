# Wildcard mode (bug-bounty)

When the engagement is a bug-bounty program with `*.example.com` in scope, the operator
needs guardrails that catch overreach without slowing the work.

## Rules

1. **Asset must resolve to the wildcard root.** Before any active probe, confirm the
   target's apex domain matches `*.example.com`. Verify via authoritative NS (the company's
   nameservers) — third-party CNAME chains can lie.
2. **Acquisition / partner domains are usually out of scope.** If the program lists
   acquired-company domains separately, treat them as separate scope items.
3. **Out-of-scope tiers stay out.** Common tiers: `*.dev.example.com`, `*.staging.example.com`,
   third-party SaaS at `support.example.com` (Zendesk), etc. Read the program rules.
4. **Brand-protection assets are not in-scope.** `example.support`, `example-help.com`,
   etc. — typosquats the company defensively owns, but doesn't host services on.

## Validation checklist (before pulling the trigger on an active probe)

- [ ] Asset resolves under the wildcard? `dig +short <asset>` chains to apex.
- [ ] NS records match the company's nameservers (or known SaaS-with-NS-permission like
      Cloudflare under company's account)?
- [ ] Not in any explicit out-of-scope list?
- [ ] Not pointing at a dangling CNAME the bug-bounty program already paid out for?

## Common landmines

- **Public-cloud-hosted apps.** `app.example.com` CNAME → `xyz.s3.amazonaws.com`. The S3
  bucket is *the company's* asset. The S3 *service* is Amazon's. Don't break the service.
- **Third-party SaaS at company subdomains.** `careers.example.com` → Greenhouse. SaaS
  vendor's own bugs (Greenhouse bugs) are out of scope. Bugs in the company's *config*
  of that SaaS are in scope.
- **Dangling CNAMEs.** If `old.example.com` CNAMEs to a defunct provider, register-takeover
  may be a valid finding. Confirm with the program before claiming.
