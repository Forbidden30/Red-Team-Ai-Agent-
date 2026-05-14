# A06:2021 — Vulnerable and Outdated Components

The CVE pipeline class. A dependency the target uses has a public vuln, and the target
hasn't patched.

## Surfaces

- Frontend libraries pinned in package.json / yarn.lock / pnpm-lock.yaml.
- Backend deps (requirements.txt / go.sum / pom.xml / Gemfile.lock / composer.lock).
- Container base images and OS packages inside the container.
- WordPress / Drupal / Magento plugins.
- Embedded JS in static assets (`/vendor/jquery-1.7.1.min.js`).

## Methodology

- Lockfile diff against known CVE databases (osv-scanner, dependabot output, Snyk).
- For deployed services: fingerprint version (HTTP headers, error messages, default
  asset paths, JS bundle commit-SHA in source maps).
- GHSA / NVD lookup. Cross-check that the affected version range really includes the
  target's version.
- Reproduce locally before reporting — vendor often backports fixes silently.

## Reporting nuance

- For bug bounty, "outdated jQuery" alone is usually low-value. Pair it with an
  exploitable sink (XSS sink in a callsite using the vulnerable jQuery function).
- For pentest, list as Medium with an upgrade recommendation, but only escalate to High
  if exploitability is shown.

## Hardening

- Lockfile-driven CI scanning (osv-scanner, dependabot, snyk).
- Automated PR for security upgrades.
- SBOM generation + storage; subscribe to upstream advisories for top-N deps.

## References

- OWASP A06:2021
- OSV.dev — open-source vulnerability database
- GitHub Advisory Database
