# httpx — usage notes

Fast HTTP toolkit from ProjectDiscovery. Used between subfinder/amass output and the
real testing — turns "list of hostnames" into "list of *live* hostnames with metadata".

## Common one-liners

```bash
# Probe a host list, keep only live, output status / title / tech
httpx -l hosts.txt -status-code -title -tech-detect -o live.txt

# JSON output with cert metadata + favicon hash
httpx -l hosts.txt -tls-grab -favicon -j -o live.jsonl

# Pipe from subfinder
subfinder -d example.com -silent | httpx -silent -status-code -title

# With custom headers / paths
httpx -l hosts.txt -path /api/v1/health -mc 200 -o api-alive.txt
```

## Useful flags

- `-tech-detect` — Wappalyzer-like tech fingerprint.
- `-favicon` — mmh3 favicon hash (use with Shodan `http.favicon.hash:<value>` to find
  more of the same fleet).
- `-tls-grab` — extract certificate metadata (subject, SAN, issuer).
- `-cdn` — flag CDN-fronted hosts so you don't waste time scanning the CDN edge.
- `-asn` — annotate with ASN / org.

## References

- github.com/projectdiscovery/httpx
