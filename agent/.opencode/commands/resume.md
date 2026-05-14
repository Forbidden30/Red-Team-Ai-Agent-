---
name: resume
description: Resume the most recent engagement.
---

Usage: `/resume` or `/resume <engagement-name>`

Loads the engagement state from `agent/engagements/<name>/` and prints `/status`.
The operator picks the next step from the followups in `intel.md`.

Designed to pick up cleanly after `/stop` or an interrupted session.
