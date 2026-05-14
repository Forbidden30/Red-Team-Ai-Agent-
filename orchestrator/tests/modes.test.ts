import { describe, it, expect } from "vitest";
import { MODES, getMode } from "@/lib/modes";

describe("modes", () => {
  it("exposes all six modes", () => {
    const ids = MODES.map((m) => m.id).sort();
    expect(ids).toEqual(["defense", "internal", "osint", "recon", "report", "vuln"]);
  });

  it("marks active modes as scope-required", () => {
    for (const id of ["recon", "vuln", "internal"] as const) {
      const m = MODES.find((x) => x.id === id);
      expect(m?.requiresScope, `${id} should require scope`).toBe(true);
    }
  });

  it("leaves OSINT / report / defense scope-optional", () => {
    for (const id of ["osint", "report", "defense"] as const) {
      const m = MODES.find((x) => x.id === id);
      expect(m?.requiresScope, `${id} should not require scope`).toBe(false);
    }
  });

  it("getMode falls back to the first mode for unknown IDs", () => {
    // @ts-expect-error testing fallback
    expect(getMode("bogus").id).toBe(MODES[0].id);
  });

  it("getMode returns the right mode for a known ID", () => {
    expect(getMode("internal").id).toBe("internal");
  });
});
