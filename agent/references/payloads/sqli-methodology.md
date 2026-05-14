# SQL injection — methodology

## Triage flowchart

1. **Identify a parameter that ends up in a SQL query.** Suspect every dynamic value
   the server uses for lookup / filter / sort.
2. **Probe injection.** Single quote → 500 or syntax error? Boolean true vs false →
   different content? Time-based payload → measurable delay?
3. **Fingerprint the DB.** Error message reveals it (Postgres, MySQL, MSSQL, Oracle,
   SQLite) or you derive from the dialect that works.
4. **Choose the technique.** Error-based, UNION-based, boolean-blind, time-blind.
5. **Extract.** Schema → table → column → data. Stay within scope (often only one row
   of proof needed).

## Probes by intent

| Goal | Payload |
|------|---------|
| Single-quote test | `'` → look for 500 / SQL fragment in response |
| Boolean true | `1 OR 1=1--` |
| Boolean false | `1 AND 1=2--` |
| MySQL time-based | `1 AND SLEEP(5)--` |
| Postgres time-based | `1; SELECT pg_sleep(5)--` |
| MSSQL time-based | `1; WAITFOR DELAY '0:0:5'--` |
| UNION column count | `' UNION SELECT NULL--` then add NULLs until 200 |

## Detection

- Repeated requests with single quotes from one source IP/account.
- Slow query log spikes (time-based).
- Application error logs with `SQLException` / `PSQLException` / database error names.
- Modern WAFs (Cloudflare, AWS WAF, Akamai) match the standard payload corpus.

## Hardening

- **Parameterized queries everywhere.** Stop reading.
- ORM-level "raw query" gates with code-review hook.
- Least-privilege DB account per service.

## Tooling

- **sqlmap** is the de-facto fuzzer. Use `--batch --crawl=2 --random-agent --threads=4`
  with `-r request.txt` from a captured Burp/Caido request. Tune from there.
- For blind injection on production-sensitive targets, prefer manual binary-search over
  sqlmap to control rate and dump volume.

## References

- PortSwigger — SQL injection labs (canonical).
- OWASP SQL Injection Prevention Cheat Sheet.
- sqlmap manual.
