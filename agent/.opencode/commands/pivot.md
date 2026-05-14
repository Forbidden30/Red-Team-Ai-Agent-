---
name: pivot
description: Plan a controlled pivot from one in-scope host to another.
---

Usage: `/pivot <from-host> -> <to-host>`

Pre-conditions:
- Both hosts in `scope.json.authorized_targets`.
- `scope.json.rules_of_engagement.lateral_movement_allowed = true`.
- Operator has confirmed the foothold on `<from-host>`.

The operator plans (does not execute) a pivot using established tooling (Chisel, Ligolo-ng,
SSH port-forwarding, socat) and records:
- Method chosen + why
- Required privileges on the foothold
- Network reachability change
- Detection footprint
- Cleanup procedure

The actual pivot command runs only after operator (human) approval. The plan goes into
`artifacts/pivot-plans/`.
