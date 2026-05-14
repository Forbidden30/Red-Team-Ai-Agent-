# Payload methodology references

These are not exhaustive payload encyclopedias — they're decision guides. For each
vulnerability class:

- **Trigger probe.** The simplest input that proves the class is reachable.
- **Engine fingerprint.** How to identify the specific implementation once the class
  is confirmed.
- **Context escape.** How attacker-controlled data breaks out of the data plane into the
  code plane.
- **Detection.** What a defender sees when this payload class fires.

For comprehensive payload lists, use:

- [PayloadsAllTheThings](https://github.com/swisskyrepo/PayloadsAllTheThings)
- [SecLists](https://github.com/danielmiessler/SecLists) — `Fuzzing/`, `Payloads/`
- [PortSwigger Web Security Academy](https://portswigger.net/web-security)
- [HackTricks](https://book.hacktricks.xyz/)
