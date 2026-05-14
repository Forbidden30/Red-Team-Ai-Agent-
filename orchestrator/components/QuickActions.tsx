"use client";

import { Zap } from "lucide-react";
import type { ModeId } from "@/lib/types";

interface Props {
  mode: ModeId;
  onPick: (prompt: string) => void;
  disabled?: boolean;
}

const PROMPTS: Record<ModeId, { label: string; prompt: string }[]> = {
  osint: [
    {
      label: "Subdomain enum plan",
      prompt:
        "Give me a complete passive subdomain enumeration plan for example.com. Cover crt.sh, Subfinder, Amass, Wayback CDX, GitHub code search, and certificate transparency. Include exact commands and what to do with the output.",
    },
    {
      label: "Tech stack fingerprint",
      prompt:
        "Walk me through fingerprinting an unknown web target's tech stack using only passive sources (no traffic to the target). Cover BuiltWith, Wappalyzer, archive.org snapshots, GitHub org code search, and DNS history.",
    },
    {
      label: "Cloud asset discovery",
      prompt:
        "I have a company name and a few primary domains. How do I passively enumerate AWS / Azure / GCP assets — S3 buckets, blob storage, ASN ranges, IP allocations? Give the methodology and tools.",
    },
    {
      label: "Employee / pivot points",
      prompt:
        "Passive employee enumeration for a target company: LinkedIn dorking, hunter.io email patterns, breach corpora. What's the safe / ethical version for a bug-bounty recon stage?",
    },
  ],
  recon: [
    {
      label: "External web app recon",
      prompt:
        "Outline a full external web application reconnaissance pass for a target in scope. Cover content discovery wordlist selection, JS analysis, parameter discovery, header analysis, and what to record in intel.md.",
    },
    {
      label: "Nmap strategy",
      prompt:
        "Design an nmap scan strategy for a /24 in scope where I need accurate service versions but minimal noise. Justify the flags. Include a follow-up plan once initial results come back.",
    },
    {
      label: "API discovery",
      prompt:
        "How do I discover an application's API surface from the outside — Swagger/OpenAPI exposure, GraphQL introspection, undocumented endpoints in JS bundles, mobile-app routes? Give the methodology.",
    },
  ],
  vuln: [
    {
      label: "Triage a finding",
      prompt:
        "I have a finding I want to triage. I will paste the artifact (URL / request / response / snippet). Assess severity (CVSS 3.1 vector + VRT classification), exploitability, real-world impact, and remediation. Ask me for the artifact now.",
    },
    {
      label: "Patch-bypass hunt",
      prompt:
        "Walk me through patch-bypass methodology: read the fix diff, identify the original sink, hunt for sibling sinks that share the same root cause but weren't patched. Use a recent disclosed CVE as the worked example.",
    },
    {
      label: "Auth & access control review",
      prompt:
        "Give me a structured checklist for reviewing a web app's authentication and authorization (IDOR, BOLA, BFLA, JWT, OAuth misconfig). Format as a methodology I can run end-to-end against a target.",
    },
  ],
  internal: [
    {
      label: "AD enumeration plan",
      prompt:
        "I have low-privileged domain credentials on an authorized internal pentest. Give me an Active Directory enumeration plan: BloodHound collection methods (which is least noisy?), ldapsearch queries, ACL/ACE review. What to look for first.",
    },
    {
      label: "Kerberos misconfig hunt",
      prompt:
        "Walk me through hunting Kerberos misconfigurations from a domain user: SPN enumeration for Kerberoasting, ASREP-roastable accounts, unconstrained / constrained / RBCD delegation. Detection footprint of each.",
    },
    {
      label: "Linux post-exploitation triage",
      prompt:
        "I just got a low-priv shell on a Linux host (authorized). Give me a structured triage: linPEAS categories to check first, common SUID misconfigs, sudo rules, cron paths, container-escape candidates. No autopilot — explain why each check matters.",
    },
  ],
  report: [
    {
      label: "Bug-bounty submission",
      prompt:
        "Draft a bug-bounty submission. I'll paste the finding details. Use this structure: Title, Severity (CVSS + VRT), Affected Asset, Description, Steps to Reproduce, Impact, Recommendation, References. Ask me for the details now.",
    },
    {
      label: "Executive summary",
      prompt:
        "Write a 3-5 sentence executive summary of a pentest engagement based on the findings I paste. Business-language, risk-focused, no jargon. Ask me for the findings now.",
    },
    {
      label: "Findings → backlog",
      prompt:
        "Turn a list of pentest findings into an engineering remediation backlog: each item gets a developer-friendly fix, priority, effort estimate, and acceptance criteria. Ask me for the findings now.",
    },
  ],
  defense: [
    {
      label: "Detection rules",
      prompt:
        "For a given attack technique (I'll specify), draft a Sigma rule, a Splunk SPL search, and an Elastic EQL query. Note false-positive sources and tuning steps. Ask me which technique now.",
    },
    {
      label: "Hardening checklist",
      prompt:
        "Give me a Linux / Windows / cloud hardening checklist organized by attack surface. CIS-style but prioritized — what blocks the most common attacker paths in the first hour.",
    },
    {
      label: "IR playbook",
      prompt:
        "Draft an incident-response playbook for a specific scenario (I'll specify). Phases: detect → contain → eradicate → recover → lessons. Concrete commands, not platitudes. Ask me which scenario now.",
    },
  ],
};

export default function QuickActions({ mode, onPick, disabled }: Props) {
  const items = PROMPTS[mode] ?? [];
  if (items.length === 0) return null;
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 mb-4">
      <h3 className="text-xs font-semibold flex items-center gap-2 text-neutral-300 mb-2">
        <Zap className="w-3.5 h-3.5 text-yellow-400" />
        Quick prompts — {mode}
      </h3>
      <div className="flex flex-wrap gap-2">
        {items.map((p) => (
          <button
            key={p.label}
            disabled={disabled}
            onClick={() => onPick(p.prompt)}
            className="px-2.5 py-1 text-xs bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded transition-colors disabled:opacity-50"
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
