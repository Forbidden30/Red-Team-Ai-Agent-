---
name: queue
description: Show / manage the case-collection queue for the active engagement.
---

The case queue is a SQLite-backed list of candidate findings collected by sub-agents.
Each case has: id, source-agent, artifact-ref, class-guess, status, confidence.

Usage:
- `/queue` — show pending cases
- `/queue done <id>` — mark a case resolved (operator triaged it)
- `/queue drop <id>` — drop a case (false positive)

Backed by `agent/scripts/schema.sql` (table `cases`).
