import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt } from "@/lib/prompts";
import type { ChatRequest, ModeId } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_MODES: ModeId[] = [
  "osint",
  "recon",
  "vuln",
  "internal",
  "report",
  "defense",
];

const MAX_MESSAGES = 40;
const MAX_CONTENT_CHARS = 8000;

function allowedOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  const host = req.headers.get("host");
  if (host && origin.endsWith(host)) return true;
  const allowed = (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return allowed.includes(origin);
}

export async function POST(req: NextRequest) {
  if (!allowedOrigin(req)) {
    return NextResponse.json({ error: "Origin not allowed" }, { status: 403 });
  }

  const sharedSecret = process.env.API_SHARED_SECRET;
  if (sharedSecret) {
    const provided = req.headers.get("x-api-secret");
    if (provided !== sharedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let body: ChatRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || !VALID_MODES.includes(body.mode)) {
    return NextResponse.json({ error: "Invalid or missing mode" }, { status: 400 });
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: "messages must be a non-empty array" }, { status: 400 });
  }

  const messages = body.messages
    .slice(-MAX_MESSAGES)
    .map((m) => ({
      role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: String(m.content ?? "").slice(0, MAX_CONTENT_CHARS),
    }))
    .filter((m) => m.content.length > 0);

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return NextResponse.json(
      { error: "Last message must be a non-empty user message" },
      { status: 400 },
    );
  }

  // API key check happens AFTER body validation so callers get useful error
  // messages for bad requests instead of being told the server is misconfigured.
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "ANTHROPIC_API_KEY is not configured. Copy .env.example to .env.local and set it.",
      },
      { status: 500 },
    );
  }

  const system = buildSystemPrompt(body.mode, body.scope ?? null);
  const model = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";

  const client = new Anthropic({ apiKey });

  try {
    const completion = await client.messages.create({
      model,
      max_tokens: 1500,
      system,
      messages,
    });

    const text = completion.content
      .filter((c): c is Anthropic.TextBlock => c.type === "text")
      .map((c) => c.text)
      .join("\n")
      .trim();

    return NextResponse.json({
      content: text || "(no response)",
      model: completion.model,
      usage: completion.usage,
      stop_reason: completion.stop_reason,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Upstream error: ${message}` },
      { status: 502 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    name: "Red Team AI Agent — chat API",
    method: "POST",
    fields: ["mode", "messages", "scope?"],
    modes: VALID_MODES,
  });
}
