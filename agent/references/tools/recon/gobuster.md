# gobuster — usage notes

Content discovery, DNS subdomain bruteforce, vhost discovery. Fast, simple, Go-native.

## Modes

```bash
# Directory / file discovery
gobuster dir -u https://target -w /usr/share/seclists/Discovery/Web-Content/raft-medium-words.txt \
  -t 30 -x php,html,js,json -s 200,204,301,302,307,403 -k

# DNS subdomain
gobuster dns -d example.com -w subdomains-top1mil.txt -t 30 --resolver 8.8.8.8

# Virtual host discovery
gobuster vhost -u https://target -w vhost-wordlist.txt -t 30

# Fuzzing
gobuster fuzz -u https://target/?param=FUZZ -w params.txt -k
```

## Flags

- `-t` — threads (default 10). Raise for fast scans, lower for stealth.
- `-x` — file extensions to append.
- `-s` — status codes that count as hits.
- `-k` — skip TLS verification (use during dev / self-signed).
- `--no-error` — quiet timeouts.

## When to pick gobuster over ffuf

- Faster on huge wordlists with simple status-code filters.
- Better defaults for "I just want a list of URLs that exist".

## When to pick ffuf instead

- You need response-size / content filtering, auto-calibration.
- Recursive discovery.
- Custom request templates.

## References

- github.com/OJ/gobuster
