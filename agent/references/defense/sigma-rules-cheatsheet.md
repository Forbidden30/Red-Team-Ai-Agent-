# Sigma rules cheatsheet

Sigma is the generic signature format for SIEM detections. Engagements use this for
the *defense / blue-team* deliverable — each offensive technique gets a paired detection.

## Anatomy

```yaml
title: <Descriptive title>
id: <UUIDv4>
status: experimental
description: <one-sentence what this catches>
references:
  - <link>
author: <name>
date: <YYYY/MM/DD>
logsource:
  category: process_creation       # or: webserver, firewall, etc.
  product: windows                 # or: linux, macos, apache, etc.
detection:
  selection:
    Image|endswith: '\powershell.exe'
    CommandLine|contains:
      - 'IEX'
      - 'DownloadString'
  condition: selection
falsepositives:
  - <known noise sources>
level: high
tags:
  - attack.execution
  - attack.t1059.001
```

## Templates we care about

### Kerberoasting attempt (DC event 4769)

```yaml
title: Kerberos service ticket request (RC4) — potential Kerberoasting
logsource:
  product: windows
  service: security
detection:
  sel:
    EventID: 4769
    TicketEncryptionType: '0x17'
    TicketOptions: '0x40810000'
  condition: sel
falsepositives:
  - Legacy SPNs that genuinely use RC4
level: medium
tags: [attack.credential_access, attack.t1558.003]
```

### Suspicious nmap signature on web app (Apache access log)

```yaml
title: Web scanner User-Agent — nmap NSE
logsource:
  category: webserver
detection:
  sel:
    cs-user-agent|contains: 'Mozilla/5.0 (compatible; Nmap Scripting Engine'
  condition: sel
level: low
tags: [attack.reconnaissance, attack.t1595]
```

### LSASS access by non-Defender process

```yaml
title: Access to LSASS memory by unexpected process
logsource:
  product: windows
  category: process_access
detection:
  sel:
    TargetImage|endswith: '\lsass.exe'
  filter_defender:
    SourceImage|endswith:
      - '\MsMpEng.exe'
      - '\NisSrv.exe'
  condition: sel and not filter_defender
level: high
tags: [attack.credential_access, attack.t1003.001]
```

## Producing these on demand

For a discovered offensive finding, the `report-writer` agent should emit a paired Sigma
rule into `findings/F-NN/detection.yml`. Reviewers then translate to their SIEM.

## References

- github.com/SigmaHQ/sigma — canonical repository
- Sigma specification + uncoder.io for translation
- MITRE ATT&CK technique mapping
