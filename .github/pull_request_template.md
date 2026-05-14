## Summary
<!-- 1-3 bullets describing the change. -->

## Type
- [ ] Bug fix
- [ ] Methodology / reference content
- [ ] Orchestrator UI / API
- [ ] Agent prompt refinement
- [ ] CLI / scripts
- [ ] Docs only

## Scope check
- [ ] Methodology, not weaponization.
- [ ] If the change adds offensive capability, it pairs with a detection / hardening note.
- [ ] No secrets, no engagement-specific data committed.
- [ ] References cite OWASP / PortSwigger / HackTricks / vendor docs where appropriate.

## Test plan
- [ ] `npm run typecheck` passes in `orchestrator/`
- [ ] `npm run build` passes in `orchestrator/`
- [ ] CLI smoke test: `bin/rt-agent engage test && bin/rt-agent status && rm -rf agent/engagements/test`
- [ ] (UI changes) Tried in browser with `npm run dev`

## Screenshots / output
<!-- Optional. -->
