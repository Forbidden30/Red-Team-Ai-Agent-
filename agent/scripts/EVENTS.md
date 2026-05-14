# Runtime events

The orchestrator emits structured JSON events to `agent/engagements/<name>/events.jsonl`
when sub-agents are dispatched and return. Defenders / blue team can re-purpose this for
their own visibility too.

## Event types

| Event | When | Fields |
|-------|------|--------|
| `engagement.created` | `/engage` | engagement, authorized_by, accepted_at |
| `phase.transition` | phase change | engagement, from, to, ts |
| `agent.dispatch` | operator → sub-agent | engagement, sub_agent, task, constraints |
| `agent.return` | sub-agent → operator | engagement, sub_agent, confidence, intel_delta_count |
| `finding.created` | new `findings/F-NN.md` | engagement, finding_id, class, severity |
| `finding.confirmed` | `/confirm` succeeds | engagement, finding_id |
| `scope.violation_blocked` | scope-check hook denies a command | engagement, command, reason |

## Sample line

```json
{"ts":"2026-05-14T09:20:31Z","type":"agent.dispatch","engagement":"acme-q2","sub_agent":"recon-specialist","task":"subdomain enum","constraints":["passive only"]}
```

## Consumers

- The orchestrator GUI tails this file and renders a timeline.
- `agent/scripts/check_collection_health.sh` reads it for stall detection.
- Operators grep it for forensic reconstruction after the engagement.
