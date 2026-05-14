# subfinder — usage notes

Passive subdomain enumeration. Aggregates from public sources (crt.sh, BufferOver, AnubisDB,
Wayback, various API providers).

## Default workflow

```bash
# Run with default sources, silent output
subfinder -d example.com -silent -o subs.txt

# All sources (slower, more results)
subfinder -d example.com -all -silent -o subs.txt

# With API keys configured for premium sources
subfinder -d example.com -all -silent
```

## API keys

Some sources are gated. Configure in `~/.config/subfinder/provider-config.yaml`:

```yaml
shodan: ["<api-key>"]
censys: ["<id>:<secret>"]
securitytrails: ["<api-key>"]
github: ["<personal-access-token>"]
chaos: ["<chaos-api-key>"]
```

Without keys, subfinder still works on public sources (crt.sh, AnubisDB, etc.) but the
yield drops considerably for well-mapped targets.

## Pipeline

The standard recon pipeline:

```bash
subfinder -d example.com -silent | \
  httpx -silent -status-code -title | \
  tee live.txt | \
  awk '{print $1}' > live-urls.txt
```

## References

- github.com/projectdiscovery/subfinder
