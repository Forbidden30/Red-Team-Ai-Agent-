---
name: engage
description: Initialize a new engagement workspace.
---

Usage: `/engage <engagement-name>`

Creates the directory `agent/engagements/<engagement-name>/` with:

- `scope.json` (skeleton — operator fills it in via `/auth`)
- `intel.md` (template)
- `notes.md` (empty)
- `findings/` (empty)
- `artifacts/` (empty)
- `reports/` (empty)

If the engagement already exists, refuse and suggest `/resume <name>` instead.

After creation, prompt the operator to run `/auth` so the scope is captured properly
before the recon phase starts.
