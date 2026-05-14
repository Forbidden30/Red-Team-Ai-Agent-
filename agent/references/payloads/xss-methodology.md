# XSS — methodology

Three flavors: **reflected**, **stored**, **DOM**. Workflow is the same: probe →
fingerprint context → escape → confirm execution.

## Trigger probe

Canonical marker: a unique random string + a benign tag/attr probe.

- `OWASP-XSS-MARKER-<random>` to find reflection points without firing.
- `'"><svg onload=alert(1)>` only after you've identified the context manually.

## Context fingerprint

The same input lands in different contexts and needs different escapes:

| Context | Example | Escape required |
|---------|---------|-----------------|
| HTML body | `<div>{{x}}</div>` | `<` opens a tag |
| HTML attribute (unquoted) | `<a href={{x}}>` | space + `>` |
| HTML attribute (single-quoted) | `<a href='{{x}}'>` | `'` then tag |
| HTML attribute (double-quoted) | `<a href="{{x}}">` | `"` then tag |
| JS string | `var x = "{{x}}"` | `"` + close string + `;` |
| JS template literal | `` var x = `{{x}}` `` | `` ` `` + close + `${...}` |
| URL | `<a href="{{x}}">` | `javascript:` scheme |
| CSS | `<style>color: {{x}}</style>` | `expression()` / `url(javascript:)` only in IE |

DOM XSS adds: where does the value flow *from* (source) and into (sink)?

- Sources: `location.*`, `document.referrer`, `postMessage`, `window.name`, `localStorage`.
- Sinks: `innerHTML`, `outerHTML`, `document.write`, `eval`, `setTimeout(string)`,
  `Function`, `setAttribute("href"|"src", ...)`, jQuery `$()`/`.html()`.

## Common bypasses

- **Tag/attr filters.** Try uncommon vectors: `<svg>`, `<details open ontoggle>`,
  `<iframe srcdoc>`, `<math>`, `<input autofocus onfocus>`.
- **Event handler filters.** `onerror`, `onload`, `onfocus`, `onbeforetoggle`, `onpointerrawupdate`.
- **CSP.** Hunt JSONP endpoints on the same origin, dangling base / object / iframe tags,
  `script-src 'unsafe-eval'`, `style-src 'unsafe-inline'`, `script-src 'self'` with file
  upload to same origin.
- **Filter normalization.** Hex / unicode encoding: `&#x6a;avascript:` → `javascript:`.
- **Trusted Types.** Modern Chrome / Firefox enforce policies on innerHTML; bypass via
  policy creation or via sinks not covered (`Element.setAttribute` historically excluded).

## Detection (defender side)

- WAF signatures match obvious payloads; novel polyglot is the operator's edge.
- Browser CSP report-uri logs blocked inline script attempts.
- Server logs: high-entropy parameter values with `<`/`>` are signal.

## References

- PortSwigger — XSS labs (canonical).
- OWASP XSS Filter Evasion Cheat Sheet.
- Browser Security Handbook — Michal Zalewski.
- Mario Heiderich — *XSSes from heaven and hell*.
