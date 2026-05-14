---
name: config
description: Show / edit the workspace configuration.
---

Reads:
- `agent/.opencode/opencode.json` — agent + prompt configuration
- `agent/.env` — API keys + runtime settings (see `.env.example`)

Usage:
- `/config` — print current resolved config
- `/config set <key> <value>` — write to `.env`

The active engagement is taken from `$ENGAGEMENT` in `.env` (defaults to the only
directory under `agent/engagements/` if there is exactly one).
