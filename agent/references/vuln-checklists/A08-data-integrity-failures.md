# A08:2021 — Software and Data Integrity Failures

Trust violations: unsigned updates, insecure deserialization, supply-chain compromise.

## Surfaces

- **Insecure deserialization.** Java `ObjectInputStream`, Python `pickle.loads`,
  PHP `unserialize`, .NET `BinaryFormatter`, Node `node-serialize`. Untrusted bytes
  reaching these is RCE.
- **CI/CD pipeline trust.** Build artifacts signed? Pinned base images vs. `:latest`?
  Lockfiles enforced? Build steps that pull `curl | sh`?
- **Auto-update without signature verification.** App pulls update from a URL and
  executes — and the URL is hijackable or the binary is unsigned.
- **Dependency confusion.** Internal package name typoed → public registry version
  resolves first.
- **Tampered or unverified downloads.** SaaS downloads (e.g. SDK installer) over HTTPS
  but without checksum / signature verification.

## Methodology

- Find serializers via grep. Trace inputs.
- For CI/CD: read the build config. Look for build-time secrets in env, unpinned base
  images, third-party actions used without commit-SHA pin.
- For auto-update: examine the download URL + verification step in the client.

## Hardening

- Sign artifacts (Sigstore / cosign). Verify signatures on consume.
- Pin dependencies + base images to commit SHA / sha256 digest.
- Internal package registries with namespace claim to defeat dependency confusion.
- Allowlist of signers for serialized object types if deserialization is unavoidable.

## References

- OWASP A08:2021
- OWASP Deserialization Cheat Sheet
- SLSA framework (supply-chain integrity)
