import { NextRequest } from "next/server";
import { buildSystemPrompt } from "@/lib/prompts";
import { getApiKey, getMissingKeyError, getProvider, streamComplete } from "@/lib/llm";
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

  // API key check happens AFTER body validation so callers get useful error
  // messages for bad requests instead of being told the server is misconfigured.
  const provider = getProvider();
  if (!getApiKey(provider)) {
    return new Response(getMissingKeyError(provider), { status: 500 });
  }

  const system = buildSystemPrompt(body.mode, body.scope ?? null);

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(sse("start", { provider, mode: body.mode }));
      try {
        const final = await streamComplete({
          system,
          messages,
          callbacks: {
            onDelta: (delta) => controller.enqueue(sse("delta", { text: delta })),
            onError: (message) => controller.enqueue(sse("error", { message })),
          },
        });
        controller.enqueue(
          sse("done", {
            model: final.model,
            stop_reason: final.stopReason,
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
