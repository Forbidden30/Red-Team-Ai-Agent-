# ffuf — usage notes

Web fuzzer. Used for content discovery, parameter fuzzing, vhost enumeration,
authentication brute-force scenarios on authorized engagements.

## Common modes

```bash
# Path discovery
ffuf -u https://target/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-words.txt -mc 200,301,403 -ac

# Subdomain (vhost) fuzzing on a wildcard
ffuf -u https://FUZZ.target.com -w subdomains-top1mil.txt -mc 200,301,302

# Parameter fuzzing on a single endpoint
ffuf -u "https://target/api?FUZZ=test" -w params.txt -fs 1234  # filter by size to drop the baseline 404

# Recursive
ffuf -u https://target/FUZZ -w wordlist.txt -recursion -recursion-depth 2 -mc 200,301,403
```

## Operator flags

- `-mc` — match code (status codes that count as hits).
- `-fc` / `-fs` / `-fw` — filter by code / size / word-count (drop noise).
- `-ac` — auto-calibrate; ffuf measures baseline and auto-filters.
- `-rate` / `-p` — global rate (req/s) and delay between requests.
- `-H "Cookie: ..."` — auth context.
- `-of json -o out.json` — machine-readable output.

## Wordlist choice (the actual important thing)

- SecLists is the standard collection. `Discovery/Web-Content/raft-medium-words.txt` is
  a good starter; switch to `raft-large-*` if you have time budget.
- Stack-specific: SecLists has lists for Apache, Tomcat, IIS, AspNet, Drupal, WordPress,
  etc. Match the wordlist to the fingerprint.
- For parameter fuzzing: SecLists `Discovery/Web-Content/burp-parameter-names.txt`.

## References

- github.com/ffuf/ffuf
- danielmiessler/SecLists
