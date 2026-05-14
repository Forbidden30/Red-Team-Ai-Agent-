---
name: auth
description: Confirm written authorization and set engagement scope.
---

Before any active work, confirm:

1. **Written authorization exists.** Statement of Work, bug-bounty policy, internal red-team
   charter, or signed Letter of Authorization. Reject the session otherwise.
2. **Targets are listed.** Build the `scope.json` file at
   `agent/engagements/<name>/scope.json`:

```json
{
  "engagement": "<name>",
  "authorized_by": "<name + email of authorizer>",
  "accepted_at": "<ISO-8601 timestamp>",
  "authorized_targets": ["*.example.com", "10.0.0.0/24", "api.example.com"],
  "out_of_scope": ["prod.payments.example.com"],
  "rules_of_engagement": {
    "noise_budget": "moderate",
    "data_exfil_allowed": false,
    "lateral_movement_allowed": true
  }
}
```

3. **Print the scope** and ask the operator to confirm before continuing.

If any of the three is missing, halt and tell the operator what to provide.
