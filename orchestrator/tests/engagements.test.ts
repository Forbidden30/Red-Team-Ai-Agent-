import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

/**
 * Tests for lib/engagements.ts read paths. The library hard-codes
 * REPO_ROOT = path.resolve(process.cwd(), ".."), so we change process.cwd by
 * placing a fake orchestrator directory inside a tmp repo root.
 */
let tmp: string;
let savedCwd: string;
let listEngagements: typeof import("@/lib/engagements")["listEngagements"];
let getEngagement: typeof import("@/lib/engagements")["getEngagement"];
let listFindings: typeof import("@/lib/engagements")["listFindings"];
let readFinding: typeof import("@/lib/engagements")["readFinding"];

beforeAll(async () => {
  tmp = await fs.mkdtemp(path.join(os.tmpdir(), "rt-engagements-"));
  const engDir = path.join(tmp, "agent", "engagements");
  await fs.mkdir(engDir, { recursive: true });

  // Engagement 1: acme-q2 with one finding.
  const eng1 = path.join(engDir, "acme-q2");
  await fs.mkdir(path.join(eng1, "findings"), { recursive: true });
  await fs.mkdir(path.join(eng1, "artifacts"), { recursive: true });
  await fs.mkdir(path.join(eng1, "reports"), { recursive: true });
  await fs.writeFile(
    path.join(eng1, "scope.json"),
    JSON.stringify({
      engagement: "acme-q2",
      authorized_by: "sec@acme.example",
      accepted_at: "2026-05-14T00:00:00Z",
      authorized_targets: ["*.acme.example"],
      out_of_scope: [],
    }),
  );
  await fs.writeFile(path.join(eng1, "intel.md"), "# intel\n- host: api.acme.example\n");
  await fs.writeFile(path.join(eng1, "notes.md"), "- first note\n");
  await fs.writeFile(path.join(eng1, "events.jsonl"), '{"type":"x"}\n{"type":"y"}\n');
  await fs.writeFile(
    path.join(eng1, "findings", "F-01-test.md"),
    [
      "# Reflected XSS in /search",
      "- ID: F-01",
      "- Severity: High",
      "- Class: XSS",
      "- Status: Open",
      "- Affected asset: api.acme.example",
    ].join("\n"),
  );

  // Engagement 2: empty
  await fs.mkdir(path.join(engDir, "empty"), { recursive: true });

  // Pretend we're running from <tmp>/orchestrator so REPO_ROOT = tmp.
  const fakeOrch = path.join(tmp, "orchestrator");
  await fs.mkdir(fakeOrch, { recursive: true });
  savedCwd = process.cwd();
  process.chdir(fakeOrch);

  // Import AFTER cwd is set so the module-level REPO_ROOT resolves to tmp.
  const mod = await import("@/lib/engagements");
  listEngagements = mod.listEngagements;
  getEngagement = mod.getEngagement;
  listFindings = mod.listFindings;
  readFinding = mod.readFinding;
});

afterAll(async () => {
  process.chdir(savedCwd);
  await fs.rm(tmp, { recursive: true, force: true });
});

describe("listEngagements", () => {
  it("returns engagements with counts", async () => {
    const items = await listEngagements();
    const names = items.map((i) => i.name).sort();
    expect(names).toEqual(["acme-q2", "empty"]);

    const acme = items.find((i) => i.name === "acme-q2")!;
    expect(acme.counts.findings).toBe(1);
    expect(acme.counts.events).toBe(2);
  });
});

describe("getEngagement", () => {
  it("returns scope details for a known engagement", async () => {
    const e = await getEngagement("acme-q2");
    expect(e?.scope?.engagement).toBe("acme-q2");
    expect(e?.scope?.authorized_targets).toEqual(["*.acme.example"]);
  });

  it("returns null for unknown engagement", async () => {
    const e = await getEngagement("does-not-exist");
    expect(e).toBeNull();
  });

  it("rejects names with path traversal characters", async () => {
    await expect(getEngagement("../../etc/passwd")).rejects.toThrow();
  });
});

describe("listFindings", () => {
  it("parses finding metadata from markdown", async () => {
    const findings = await listFindings("acme-q2");
    expect(findings).toHaveLength(1);
    expect(findings[0].id).toBe("F-01");
    expect(findings[0].title).toBe("Reflected XSS in /search");
    expect(findings[0].severity).toBe("High");
    expect(findings[0].class).toBe("XSS");
    expect(findings[0].status).toBe("Open");
    expect(findings[0].affectedAsset).toBe("api.acme.example");
  });

  it("returns empty array for an engagement with no findings", async () => {
    const findings = await listFindings("empty");
    expect(findings).toEqual([]);
  });
});

describe("readFinding", () => {
  it("returns the markdown body", async () => {
    const md = await readFinding("acme-q2", "F-01-test.md");
    expect(md).toContain("Reflected XSS");
  });

  it("rejects path-traversal in the filename", async () => {
    const md = await readFinding("acme-q2", "../../etc/passwd");
    expect(md).toBeNull();
  });

  it("returns null for a missing file", async () => {
    const md = await readFinding("acme-q2", "F-99-nope.md");
    expect(md).toBeNull();
  });
});
