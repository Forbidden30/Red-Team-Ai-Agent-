# amass — usage notes

OWASP's recon tool. Heavier than subfinder, slower, often more thorough especially for
well-attacked targets.

## Modes

```bash
# Passive only — no DNS queries to target
amass enum -passive -d example.com -o amass-passive.txt

# Active (uses DNS, requires recursive resolver)
amass enum -d example.com -o amass-active.txt

# Intel mode — finds related orgs / domains via WHOIS / cert pivots
amass intel -d example.com -whois -o intel.txt
amass intel -addr 192.0.2.0/24 -o by-asn.txt
```

## Config

- `~/.config/amass/config.yaml` for API keys (similar set to subfinder).
- `~/.config/amass/datasources.yaml` for source selection.

## When to pick amass over subfinder

- You're early in recon and need every possible angle.
- The target has a long history (lots of historical certs, archived snapshots).
- You want WHOIS-pivoted "what else does this org own" data — that's amass intel mode.

When you just need a fast first-pass list, subfinder is enough.

## References

- github.com/owasp-amass/amass
