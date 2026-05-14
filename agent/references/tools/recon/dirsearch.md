# dirsearch — usage notes

Web path scanner. Smart defaults, good for "I want sane behavior without thinking".

## Common runs

```bash
# Default — uses dirsearch's bundled wordlist
dirsearch -u https://target -t 30 -i 200,204,301,302,403

# Specific wordlist + extensions
dirsearch -u https://target -w /usr/share/seclists/Discovery/Web-Content/raft-medium.txt \
  -e php,html,js -t 30

# Recursive
dirsearch -u https://target -r --max-recursion-depth 2

# With auth
dirsearch -u https://target --cookie "session=abc"
dirsearch -u https://target --header "Authorization: Bearer xyz"

# Output to JSON
dirsearch -u https://target --format json -o out.json
```

## Useful defaults dirsearch ships

- Sane status-code filtering.
- Automatic wildcard / 200-everything detection.
- `wordlists/web-extensions.txt` for tech-specific patterns.

## References

- github.com/maurosoria/dirsearch
