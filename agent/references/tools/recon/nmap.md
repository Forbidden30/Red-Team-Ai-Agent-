# nmap — usage notes

Not a tutorial; a working operator's cheat-sheet of the flag combos that get used.

## Default scans by situation

| Situation | Command |
|-----------|---------|
| First-look service map on a host | `nmap -sV -sC --top-ports 1000 -T3 <host>` |
| External / detection-aware | `nmap -sS -Pn -T2 --max-rate 50 -p 1-65535 <host>` |
| Discover hosts on an internal /24 | `nmap -sn -PE -PP -PS22,80,443 -PA80,443 10.0.0.0/24` |
| All ports + scripts on a single host | `nmap -p- -sV -sC --min-rate 500 <host>` |
| UDP top-100 (slow!) | `nmap -sU --top-ports 100 -T3 <host>` |

## Flag reference (the ones you'll actually use)

- `-sS` (SYN) — default, requires root, less noisy than full-connect.
- `-sT` (full TCP connect) — non-root, logs in dest. Use when -sS is filtered weirdly.
- `-sV` — service-version detection. Adds noise (banner grabs).
- `-sC` — default NSE scripts. Roughly equivalent to `--script=default`.
- `-Pn` — skip host discovery. Use when ICMP / ARP is blocked.
- `-T<0-5>` — timing template. T0 paranoid → T5 insane. T3 is the default reasonable.
- `--min-rate` / `--max-rate` — packets per second cap (avoids the timing presets).
- `--top-ports N` — top N most-frequent ports per nmap-services freq table.
- `-p-` — all 65535 ports.
- `-oA <prefix>` — output normal + greppable + XML.

## Detection footprint

- A `-sS --top-ports 1000 -T3` finishes in seconds and is *very* visible to any IDS
  watching the link.
- `-T2 --max-rate 50` is the typical "we don't want to fire NIDS alerts" pace.
- NSE scripts (`-sC` / `--script`) do banner grabs and probes that look like real attacks
  to behavioral defenders. Use them on hosts you've already decided are interesting.

## References

- nmap.org/book/man.html — the canonical reference
