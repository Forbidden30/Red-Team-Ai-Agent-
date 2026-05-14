# nuclei — usage notes

Template-based vulnerability scanner from ProjectDiscovery. Useful for the *known-CVE*
and *exposed-misconfiguration* layer of an engagement; weak on logic and authz.

## Default scans

```bash
# High/critical only against a host
nuclei -u https://target -severity high,critical

# Against a list, with exposures + misconfig + tech-fingerprint templates
nuclei -l hosts.txt -tags exposure,misconfig,tech -severity medium,high,critical

# Updated templates, threads capped, output JSONL
nuclei -update-templates
nuclei -l hosts.txt -c 25 -rate-limit 60 -j -o nuclei.jsonl
```

## Operator notes

- **False positives are real.** Verify before adding to a finding. Re-run the matching
  template in isolation with `-debug-req` to see what it sent and matched on.
- **Stay in scope.** `-l hosts.txt` should already be filtered to in-scope. Nuclei does
  not enforce scope on follow-up redirects.
- **Rate.** `-rate-limit` is requests per second globally; `-c` is concurrent templates.
  Tune to fit `scope.json.rules_of_engagement.noise_budget`.
- **Custom templates.** When you find a class of issue across a target's assets, write a
  one-off YAML template and run it across the host list. Keep custom templates under
  `agent/engagements/<name>/artifacts/nuclei-templates/`.

## References

- github.com/projectdiscovery/nuclei
- nuclei-templates repo
