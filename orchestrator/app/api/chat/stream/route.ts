import { NextRequest } from "next/server";
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

const enc = new TextEncoder();
const sse = (event: string, data: unknown) =>
  enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

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
    return new Response("Origin not allowed", { status: 403 });
  }
  const sharedSecret = process.env.API_SHARED_SECRET;
  if (sharedSecret) {
    const provided = req.headers.get("x-api-secret");
    if (provided !== sharedSecret) {
      return new Response("Unauthorized", { status: 401 });
    }
  }
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response("ANTHROPIC_API_KEY not configured", { status: 500 });
  }

  let body: ChatRequest;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (!body || !VALID_MODES.includes(body.mode)) {
    return new Response("Invalid or missing mode", { status: 400 });
  }
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return new Response("messages must be a non-empty array", { status: 400 });
  }

  const messages = body.messages
    .slice(-MAX_MESSAGES)
    .map((m) => ({
      role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: String(m.content ?? "").slice(0, MAX_CONTENT_CHARS),
    }))
    .filter((m) => m.content.length > 0);

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return new Response("Last message must be a non-empty user message", { status: 400 });
  }

  const system = buildSystemPrompt(body.mode, body.scope ?? null);
  const model = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";
  const client = new Anthropic({ apiKey });

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(sse("start", { model, mode: body.mode }));
      try {
        const upstream = client.messages.stream({
          model,
          max_tokens: 1500,
          system,
          messages,
        });

        upstream.on("text", (delta) => {
          controller.enqueue(sse("delta", { text: delta }));
        });

        upstream.on("error", (err) => {
          controller.enqueue(
            sse("error", { message: err instanceof Error ? err.message : String(err) }),
          );
        });

        const final = await upstream.finalMessage();
        controller.enqueue(
          sse("done", {
            stop_reason: final.stop_reason,
            usage: final.usage,
          }),
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        controller.enqueue(sse("error", { message }));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
