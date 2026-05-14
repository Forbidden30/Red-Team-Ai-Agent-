# A05:2021 — Security Misconfiguration

Default-credential and default-config-left-as-shipped bugs. Cheap to find, often P1.

## Surfaces

- **Admin interfaces with default creds.** Jenkins, Tomcat manager, RabbitMQ admin,
  Solr, Kibana, Grafana, MongoDB / Redis no-auth, Elasticsearch no-auth.
- **Verbose error pages.** Stack traces, framework versions, internal paths.
- **Directory listing enabled.** `/uploads/`, `/backup/`, `/.git/`.
- **Misconfigured headers.** CSP missing, `X-Frame-Options` missing → clickjacking,
  `Access-Control-Allow-Origin: *` with credentials.
- **Cloud bucket misconfig.** Public S3 / GCS / Azure-Blob; public-list-by-default IAM.
- **Exposed actuators / debug endpoints.** Spring Actuator `/heapdump` `/env` `/trace`,
  Django `DEBUG=True`, Flask debug PIN-protected console.
- **CORS misconfig.** Reflective `Access-Control-Allow-Origin` with `Allow-Credentials`.
- **HTTP method overrides.** `X-HTTP-Method-Override: DELETE` accepted on POST endpoints.

## Methodology

- nuclei templates `exposures/` and `misconfiguration/`.
- Manually check `/.git/HEAD`, `/.env`, `/.well-known/security.txt`, `/server-status`,
  `/actuator/*`, `/swagger.json`, `/api-docs`.
- Header analysis with `securityheaders.com` or local httpx.
- CSP with `csp-evaluator` (Google).

## Hardening

- Default-deny on everything (firewall, IAM, CORS).
- Strip server / framework version headers.
- Disable debug / actuator endpoints in production builds.
- Auditable config-drift detection (CIS-benchmark scanning + alerting).

## References

- OWASP A05:2021
- CIS Benchmarks (per platform)
- Spring Actuator hardening docs
