---
name: confirm
description: Confirm a finding by re-running its PoC steps.
---

Usage: `/confirm F-<NN>`

Re-runs the steps in `findings/F-NN/proof-of-impact.md` and verifies the expected output
still matches. Useful before pasting into a bug-bounty report or final pentest report.

If the result has drifted (e.g. the vendor patched it between discovery and report), the
operator flags the finding as `Mitigated` instead of `Open` and notes the change.
