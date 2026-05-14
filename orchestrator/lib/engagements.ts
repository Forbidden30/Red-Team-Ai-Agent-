/**
 * Server-side helpers for reading the agent/engagements/ workspace from the
 * orchestrator. The orchestrator is intended for local dev usage so this is a
 * direct filesystem read; do not expose this without authentication when running
 * outside localhost.
 */
import fs from "node:fs/promises";
import path from "node:path";

export interface EngagementSummary {
  name: string;
  path: string;
  scope?: {
    engagement?: string;
    authorized_by?: string;
    accepted_at?: string | null;
    authorized_targets?: string[];
    out_of_scope?: string[];
  };
  counts: {
    findings: number;
    artifacts: number;
    reports: number;
    events: number;
  };
}

export interface FindingSummary {
  id: string;
  file: string;
  title: string;
  severity?: string;
  class?: string;
  status?: string;
  affectedAsset?: string;
}

const REPO_ROOT = path.resolve(process.cwd(), "..");
const ENGAGEMENTS_DIR = path.join(REPO_ROOT, "agent", "engagements");

function safeName(name: string): string {
  if (!/^[a-z0-9][a-z0-9._-]*$/i.test(name)) {
    throw new Error("Invalid engagement name");
  }
  return name;
}

export async function listEngagements(): Promise<EngagementSummary[]> {
  let entries: string[];
  try {
    entries = await fs.readdir(ENGAGEMENTS_DIR);
  } catch {
    return [];
  }
  const out: EngagementSummary[] = [];
  for (const name of entries) {
    if (name.startsWith(".")) continue;
    const base = path.join(ENGAGEMENTS_DIR, name);
    const stat = await fs.stat(base).catch(() => null);
    if (!stat?.isDirectory()) continue;
    out.push(await summarize(name));
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

async function summarize(name: string): Promise<EngagementSummary> {
  const base = path.join(ENGAGEMENTS_DIR, safeName(name));
  const scope = await readJson<EngagementSummary["scope"]>(
    path.join(base, "scope.json"),
  ).catch(() => undefined);
  const counts = {
    findings: (await listFiles(path.join(base, "findings"), /^F-.*\.md$/)).length,
    artifacts: (await listFiles(path.join(base, "artifacts"))).length,
    reports: (await listFiles(path.join(base, "reports"), /\.md$/)).length,
    events: await countLines(path.join(base, "events.jsonl")),
  };
  return { name, path: base, scope, counts };
}

export async function getEngagement(name: string): Promise<EngagementSummary | null> {
  const safe = safeName(name);
  const base = path.join(ENGAGEMENTS_DIR, safe);
  const stat = await fs.stat(base).catch(() => null);
  if (!stat?.isDirectory()) return null;
  return summarize(safe);
}

export async function listFindings(name: string): Promise<FindingSummary[]> {
  const safe = safeName(name);
  const dir = path.join(ENGAGEMENTS_DIR, safe, "findings");
  const files = await listFiles(dir, /^F-.*\.md$/);
  const out: FindingSummary[] = [];
  for (const f of files) {
    const full = path.join(dir, f);
    const content = await fs.readFile(full, "utf8").catch(() => "");
    out.push(parseFinding(f, full, content));
  }
  return out.sort((a, b) => a.id.localeCompare(b.id));
}

export async function readFinding(name: string, file: string): Promise<string | null> {
  const safe = safeName(name);
  // file must not escape findings/
  if (!/^F-[a-z0-9._-]+\.md$/i.test(file)) return null;
  const full = path.join(ENGAGEMENTS_DIR, safe, "findings", file);
  return fs.readFile(full, "utf8").catch(() => null);
}

export async function readIntel(name: string): Promise<string | null> {
  const safe = safeName(name);
  return fs
    .readFile(path.join(ENGAGEMENTS_DIR, safe, "intel.md"), "utf8")
    .catch(() => null);
}

export async function readNotes(name: string): Promise<string | null> {
  const safe = safeName(name);
  return fs
    .readFile(path.join(ENGAGEMENTS_DIR, safe, "notes.md"), "utf8")
    .catch(() => null);
}

// --- helpers ---------------------------------------------------------------

async function listFiles(dir: string, pattern?: RegExp): Promise<string[]> {
  try {
    const entries = await fs.readdir(dir);
    return entries.filter((e) => (pattern ? pattern.test(e) : true));
  } catch {
    return [];
  }
}

async function readJson<T = unknown>(p: string): Promise<T> {
  const raw = await fs.readFile(p, "utf8");
  return JSON.parse(raw) as T;
}

async function countLines(p: string): Promise<number> {
  try {
    const buf = await fs.readFile(p);
    if (buf.length === 0) return 0;
    let count = 0;
    for (const b of buf) if (b === 0x0a) count++;
    return count;
  } catch {
    return 0;
  }
}

function parseFinding(file: string, full: string, content: string): FindingSummary {
  const idMatch = file.match(/^(F-[0-9]+)/);
  const id = idMatch?.[1] ?? file.replace(/\.md$/, "");
  const titleMatch = content.match(/^#\s+(.+?)\s*$/m);
  const severity = field(content, "Severity");
  const cls = field(content, "Class");
  const status = field(content, "Status");
  const affectedAsset = field(content, "Affected asset");
  return {
    id,
    file,
    title: titleMatch?.[1] ?? id,
    severity,
    class: cls,
    status,
    affectedAsset,
  };
}

function field(content: string, name: string): string | undefined {
  const re = new RegExp(`^-\\s+${name}:\\s+(.+)$`, "m");
  return content.match(re)?.[1]?.trim();
}
