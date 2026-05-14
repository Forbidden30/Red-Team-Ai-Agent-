import {
  Search,
  Radar,
  AlertTriangle,
  Network,
  FileText,
  Shield,
  type LucideIcon,
} from "lucide-react";
import type { ModeId } from "./types";

export interface ModeDef {
  id: ModeId;
  name: string;
  short: string;
  icon: LucideIcon;
  color: string;
  description: string;
  /** If true, the user must have an accepted Scope before the mode is usable. */
  requiresScope: boolean;
}

export const MODES: ModeDef[] = [
  {
    id: "osint",
    name: "OSINT",
    short: "Passive intel",
    icon: Search,
    color: "cyan",
    description:
      "Passive open-source intelligence — subdomain enum, certificate transparency, leaked data, GitHub dorks, archives.",
    requiresScope: false,
  },
  {
    id: "recon",
    name: "Reconnaissance",
    short: "Active recon planning",
    icon: Radar,
    color: "blue",
    description:
      "Active recon methodology — port/service enumeration plans, attack-surface mapping, tooling choice.",
    requiresScope: true,
  },
  {
    id: "vuln",
    name: "Vulnerability Analysis",
    short: "Vuln triage",
    icon: AlertTriangle,
    color: "orange",
    description:
      "CVE lookup, weakness analysis, exploitability triage, prioritization for authorized targets.",
    requiresScope: true,
  },
  {
    id: "internal",
    name: "Internal Pentest",
    short: "Post-foothold methodology",
    icon: Network,
    color: "red",
    description:
      "Internal assessment methodology — AD enumeration plans, lateral movement concepts, privilege-escalation review (advisory only).",
    requiresScope: true,
  },
  {
    id: "report",
    name: "Report Writing",
    short: "Findings & exec summary",
    icon: FileText,
    color: "green",
    description:
      "Draft findings, executive summaries, CVSS / VRT scoring, remediation roadmaps.",
    requiresScope: false,
  },
  {
    id: "defense",
    name: "Defense / Blue Team",
    short: "Detection & hardening",
    icon: Shield,
    color: "purple",
    description:
      "Detection rule ideas, hardening recommendations, incident-response playbooks, threat hunts.",
    requiresScope: false,
  },
];

export const getMode = (id: ModeId): ModeDef =>
  MODES.find((m) => m.id === id) ?? MODES[0];
