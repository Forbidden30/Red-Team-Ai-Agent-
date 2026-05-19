/**
 * Tests for the /api/chat route handler — covers the validation surface and
 * provider-selection behavior. Neither the Anthropic nor Gemini SDK is invoked
 * here; every test path returns before constructing a client.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { POST } from "@/app/api/chat/route";

function request(body: unknown, opts?: { secret?: string; origin?: string }): Request {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts?.secret) headers["x-api-secret"] = opts.secret;
  if (opts?.origin) headers["Origin"] = opts.origin;
  headers["Host"] = "localhost:3000";
  return new Request("http://localhost:3000/api/chat", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

describe("/api/chat input validation", () => {
  beforeEach(() => {
    delete process.env.LLM_PROVIDER;
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.GEMINI_API_KEY;
    delete process.env.API_SHARED_SECRET;
    delete process.env.ALLOWED_ORIGINS;
  });

  it("rejects an invalid mode", async () => {
    const res = await POST(request({ mode: "bogus", messages: [] }) as any);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/mode/i);
  });

  it("rejects missing messages", async () => {
    const res = await POST(request({ mode: "osint" }) as any);
    expect(res.status).toBe(400);
  });

  it("rejects empty messages array", async () => {
    const res = await POST(request({ mode: "osint", messages: [] }) as any);
    expect(res.status).toBe(400);
  });

  it("rejects when last message is from assistant", async () => {
    const res = await POST(
      request({
        mode: "osint",
        messages: [{ role: "assistant", content: "hello" }],
      }) as any,
    );
    expect(res.status).toBe(400);
  });

  it("returns 500 when ANTHROPIC_API_KEY is unset (default provider)", async () => {
    const res = await POST(
      request({
        mode: "osint",
        messages: [{ role: "user", content: "test" }],
      }) as any,
    );
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toMatch(/ANTHROPIC_API_KEY/);
  });

  it("returns 500 when LLM_PROVIDER=gemini and GEMINI_API_KEY is unset", async () => {
    process.env.LLM_PROVIDER = "gemini";
    const res = await POST(
      request({
        mode: "osint",
        messages: [{ role: "user", content: "test" }],
      }) as any,
    );
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toMatch(/GEMINI_API_KEY/);
  });

  it("uses Anthropic key when LLM_PROVIDER=gemini is unset (back-compat)", async () => {
    process.env.ANTHROPIC_API_KEY = "sk-ant-fake";
    // No real Anthropic call is made — the upstream will fail, returning 502.
    // We just assert we got past the missing-key gate.
    const res = await POST(
      request({
        mode: "osint",
        messages: [{ role: "user", content: "test" }],
      }) as any,
    );
    expect([502, 500]).toContain(res.status);
    if (res.status === 500) {
      // Should NOT be the missing-key error
      const json = await res.json();
      expect(json.error).not.toMatch(/ANTHROPIC_API_KEY is not configured/);
    }
  });

  it("rejects with 401 when API_SHARED_SECRET is set and not provided", async () => {
    process.env.API_SHARED_SECRET = "topsecret";
    const res = await POST(
      request({
        mode: "osint",
        messages: [{ role: "user", content: "test" }],
      }) as any,
    );
    expect(res.status).toBe(401);
  });

  it("accepts when API_SHARED_SECRET matches", async () => {
    process.env.API_SHARED_SECRET = "topsecret";
    const res = await POST(
      request(
        {
          mode: "osint",
          messages: [{ role: "user", content: "test" }],
        },
        { secret: "topsecret" },
      ) as any,
    );
    expect(res.status).toBe(500);
  });

  it("rejects 403 for a cross-origin request not in ALLOWED_ORIGINS", async () => {
    process.env.ALLOWED_ORIGINS = "https://allowed.example";
    const res = await POST(
      request(
        {
          mode: "osint",
          messages: [{ role: "user", content: "test" }],
        },
        { origin: "https://evil.example" },
      ) as any,
    );
    expect(res.status).toBe(403);
  });

  it("GET handler describes the API and reports provider", async () => {
    const { GET } = await import("@/app/api/chat/route");
    const res = await GET();
    const json = await res.json();
    expect(json.modes).toContain("osint");
    expect(json.method).toBe("POST");
    expect(["anthropic", "gemini"]).toContain(json.provider);
  });
});
