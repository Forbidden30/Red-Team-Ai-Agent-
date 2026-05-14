import { describe, it, expect } from "vitest";
import { buildSystemPrompt } from "@/lib/prompts";
import type { Scope } from "@/lib/types";

const SCOPE: Scope = {
  engagement: "acme-q2",
  authorizedBy: "sec-lead@acme.example",
  authorizedTargets: ["*.acme.example", "10.20.0.0/16"],
  outOfScope: ["prod.payments.acme.example"],
  acceptedAt: 1715000000000,
};

describe("buildSystemPrompt", () => {
  it("returns a non-empty string for each valid mode", () => {
    for (const mode of ["osint", "recon", "vuln", "internal", "report", "defense"] as const) {
      const prompt = buildSystemPrompt(mode, null);
      expect(prompt.length).toBeGreaterThan(200);
      expect(prompt).toMatch(/AUTHORIZED|authorized|written authorization/i);
    }
  });

  it("includes scope details when scope is provided", () => {
    const prompt = buildSystemPrompt("recon", SCOPE);
    expect(prompt).toContain("acme-q2");
    expect(prompt).toContain("*.acme.example");
    expect(prompt).toContain("10.20.0.0/16");
    expect(prompt).toContain("prod.payments.acme.example");
    expect(prompt).toContain("sec-lead@acme.example");
  });

  it("does not include scope details when scope is null", () => {
    const prompt = buildSystemPrompt("recon", null);
    expect(prompt).not.toContain("acme-q2");
  });

  it("differs between modes", () => {
    const osint = buildSystemPrompt("osint", null);
    const internal = buildSystemPrompt("internal", null);
    expect(osint).not.toEqual(internal);
    expect(osint.toLowerCase()).toContain("osint");
    expect(internal.toLowerCase()).toContain("active directory");
  });

  it("falls back to osint for unknown mode", () => {
    // @ts-expect-error testing fallback
    const prompt = buildSystemPrompt("bogus", null);
    const osint = buildSystemPrompt("osint", null);
    expect(prompt).toBe(osint);
  });
});
