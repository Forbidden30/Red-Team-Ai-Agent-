# Handoff Protocols

How the operator dispatches work to sub-agents and how sub-agents return work.

## Dispatch (operator → sub-agent)

```
[role]            <one of: recon-specialist, source-analyzer, vulnerability-analyst,
                  exploit-developer, fuzzer, osint-analyst, report-writer>
[engagement]      <engagement name>
[intel-summary]   <3 bullets summarizing intel.md>
[task]            <specific question or artifact reference>
[output]          <bullets | structured-finding | report-section | command-plan>
[constraints]     <e.g. "passive only", "stay within /api/v1", "P3 or higher",
                  "≤ 60 requests/min", "no commands that hit the target">
[references]      <comma-separated ref file paths the sub-agent should consult>
```

## Return (sub-agent → operator)

```
[result]          <answer, structured as requested>
[intel-deltas]    <new facts to write into intel.md, bulleted>
[followups]       <2-5 next steps, ranked, each as a one-liner>
[confidence]      high | medium | low + one-sentence reasoning
[evidence]        <commands / file refs / URLs that support [result]>
```

## Confidence levels

| Level | When to use |
|-------|-------------|
| `high` | Result is reproducible from the cited evidence; no significant unknowns. |
| `medium` | Result rests on inference; one or two unknowns; defensible but worth checking. |
| `low` | Speculative. Operator should treat as a question, not an answer. |

A `low` confidence return is a HARD STOP — the operator must consult the human before
acting on it.

## When NOT to dispatch

- Task is trivially answerable from `intel.md` alone. Just answer.
- Task requires human judgement (scope change, finding severity bumping, reporting tone).
  Operator handles directly with the human.

## When TO dispatch

- The work matches a sub-agent's domain *and* requires either reading a body of references
  or applying a specialized methodology.
