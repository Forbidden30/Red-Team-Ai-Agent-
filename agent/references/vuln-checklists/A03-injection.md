# A03:2021 — Injection

User-controlled data interpreted as code or query. Includes SQL injection, OS command
injection, LDAP / NoSQL / XPath injection, server-side template injection, and XSS
(which OWASP folds into Injection in 2021).

## Surfaces

- **SQL injection:** every parameter that ends up in a query string. Test error-based,
  boolean-blind, time-blind, UNION. Pay attention to ORM raw queries
  (`$queryRaw`, `db.query(string)`).
- **NoSQL injection:** MongoDB `{"$ne": null}`, Redis CRLF, etc.
- **OS command injection:** `Runtime.exec`, `child_process.exec`, `subprocess.call(shell=True)`,
  PHP `system/exec/passthru`. Backticks, `;`, `|`, `&&`, `$()`, newline.
- **SSTI:** Jinja2 / Twig / Freemarker / Mustache / Velocity. `{{7*7}}` baseline → engine
  fingerprint → context-escape.
- **XSS:** stored / reflected / DOM. Source → sink trace. Watch innerHTML / document.write /
  dangerouslySetInnerHTML / setAttribute('on*').
- **CSV / formula injection:** `=cmd|'/c calc'!A1` in exports.
- **LDAP / XPath injection:** less common but still around in directory-backed apps.

## Methodology

1. Map every input boundary (URL, body, headers, cookies, WebSocket frames).
2. Pick one class per surface. Probe with a canonical marker (e.g. `OWASP-INJ-MARKER`).
3. If reflected/interpreted, escalate to engine fingerprint, then to controlled execution.
4. Score: is the execution server-side or client-side? Auth required? Data accessible?

## Hardening

- Parameterized queries always. Stored procs / ORMs that don't allow raw strings.
- Output encoding by context (HTML body / attr / JS / CSS / URL).
- Templating engines in sandbox mode where supported.
- Strict input allowlists for shell args; prefer no shell at all.

## References

- OWASP A03:2021
- PortSwigger Web Security Academy — SQLi, XSS, SSTI, NoSQL
- HackTricks — pentest-tricks index for injection classes
