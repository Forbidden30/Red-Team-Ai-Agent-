export type ModeId =
  | "osint"
  | "recon"
  | "vuln"
  | "internal"
  | "report"
  | "defense";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
}

export interface ScanResult {
  type: string;
  content: string;
  timestamp: string;
}

export interface Scope {
  engagement: string;
  authorizedTargets: string[];
  outOfScope: string[];
  authorizedBy: string;
  acceptedAt: number;
}

export interface ChatRequest {
  mode: ModeId;
  messages: ChatMessage[];
  scope?: Scope | null;
}
