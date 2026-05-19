/**
 * Provider-agnostic LLM shim.
 *
 * Picks Anthropic (default) or Google Gemini based on the LLM_PROVIDER env var
 * and exposes a uniform complete() + streamComplete() surface to API routes.
 */
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

export type LlmRole = "user" | "assistant";
export type LlmMessage = { role: LlmRole; content: string };
export type LlmProvider = "anthropic" | "gemini";

export type CompleteResult = {
  text: string;
  model: string;
  usage?: unknown;
  stopReason?: string | null;
};

export type StreamCallbacks = {
  onDelta: (text: string) => void;
  onError?: (message: string) => void;
};

export type StreamResult = {
  model: string;
  stopReason?: string | null;
  usage?: unknown;
};

export function getProvider(): LlmProvider {
  const raw = (process.env.LLM_PROVIDER ?? "anthropic").trim().toLowerCase();
  return raw === "gemini" ? "gemini" : "anthropic";
}

export function getApiKey(provider: LlmProvider = getProvider()): string | undefined {
  return provider === "gemini"
    ? process.env.GEMINI_API_KEY
    : process.env.ANTHROPIC_API_KEY;
}

export function getModel(provider: LlmProvider = getProvider()): string {
  if (provider === "gemini") {
    return process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
  }
  return process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";
}

export function getMissingKeyError(provider: LlmProvider = getProvider()): string {
  if (provider === "gemini") {
    return "GEMINI_API_KEY is not configured. Set LLM_PROVIDER=gemini and GEMINI_API_KEY in .env.local.";
  }
  return "ANTHROPIC_API_KEY is not configured. Copy .env.example to .env.local and set it.";
}

function toGeminiContents(messages: LlmMessage[]) {
  return messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
}

export async function complete(opts: {
  system: string;
  messages: LlmMessage[];
  maxTokens?: number;
}): Promise<CompleteResult> {
  const provider = getProvider();
  const apiKey = getApiKey(provider);
  if (!apiKey) throw new Error(getMissingKeyError(provider));
  const model = getModel(provider);
  const maxTokens = opts.maxTokens ?? 1500;

  if (provider === "gemini") {
    const genAI = new GoogleGenerativeAI(apiKey);
    const m = genAI.getGenerativeModel({
      model,
      systemInstruction: opts.system,
      generationConfig: { maxOutputTokens: maxTokens },
    });
    const result = await m.generateContent({ contents: toGeminiContents(opts.messages) });
    const text = result.response.text();
    return {
      text: text || "(no response)",
      model,
      usage: result.response.usageMetadata,
      stopReason: result.response.candidates?.[0]?.finishReason ?? null,
    };
  }

  const client = new Anthropic({ apiKey });
  const completion = await client.messages.create({
    model,
    max_tokens: maxTokens,
    system: opts.system,
    messages: opts.messages,
  });
  const text = completion.content
    .filter((c): c is Anthropic.TextBlock => c.type === "text")
    .map((c) => c.text)
    .join("\n")
    .trim();
  return {
    text: text || "(no response)",
    model: completion.model,
    usage: completion.usage,
    stopReason: completion.stop_reason,
  };
}

export async function streamComplete(opts: {
  system: string;
  messages: LlmMessage[];
  maxTokens?: number;
  callbacks: StreamCallbacks;
}): Promise<StreamResult> {
  const provider = getProvider();
  const apiKey = getApiKey(provider);
  if (!apiKey) throw new Error(getMissingKeyError(provider));
  const model = getModel(provider);
  const maxTokens = opts.maxTokens ?? 1500;

  if (provider === "gemini") {
    const genAI = new GoogleGenerativeAI(apiKey);
    const m = genAI.getGenerativeModel({
      model,
      systemInstruction: opts.system,
      generationConfig: { maxOutputTokens: maxTokens },
    });
    try {
      const result = await m.generateContentStream({
        contents: toGeminiContents(opts.messages),
      });
      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) opts.callbacks.onDelta(text);
      }
      const final = await result.response;
      return {
        model,
        stopReason: final.candidates?.[0]?.finishReason ?? null,
        usage: final.usageMetadata,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      opts.callbacks.onError?.(message);
      throw err;
    }
  }

  const client = new Anthropic({ apiKey });
  return new Promise<StreamResult>((resolve, reject) => {
    const upstream = client.messages.stream({
      model,
      max_tokens: maxTokens,
      system: opts.system,
      messages: opts.messages,
    });
    upstream.on("text", (delta) => opts.callbacks.onDelta(delta));
    upstream.on("error", (err) => {
      const message = err instanceof Error ? err.message : String(err);
      opts.callbacks.onError?.(message);
    });
    upstream
      .finalMessage()
      .then((final) =>
        resolve({
          model: final.model,
          stopReason: final.stop_reason,
          usage: final.usage,
        }),
      )
      .catch(reject);
  });
}
