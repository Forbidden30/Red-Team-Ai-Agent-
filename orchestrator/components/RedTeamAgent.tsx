"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shield, Download, RotateCcw, FileText } from "lucide-react";
import AuthorizationGate from "./AuthorizationGate";
import ScopeBanner from "./ScopeBanner";
import PhaseTimeline, { type Phase } from "./PhaseTimeline";
import ModeSelector from "./ModeSelector";
import QuickActions from "./QuickActions";
import ChatPanel from "./ChatPanel";
import { MODES, getMode } from "@/lib/modes";
import type { ChatMessage, ModeId, Scope } from "@/lib/types";

const SCOPE_KEY = "rt-agent.scope.v1";
const HISTORY_KEY = "rt-agent.history.v1";

export default function RedTeamAgent() {
  const [scope, setScope] = useState<Scope | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [mode, setMode] = useState<ModeId>("osint");
  const [phase, setPhase] = useState<Phase>("recon");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showGate, setShowGate] = useState(false);
  const [streaming, setStreaming] = useState("");

  useEffect(() => {
    try {
      const s = localStorage.getItem(SCOPE_KEY);
      if (s) setScope(JSON.parse(s));
      const h = localStorage.getItem(HISTORY_KEY);
      if (h) setMessages(JSON.parse(h));
    } catch {
      // ignore corrupted localStorage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (scope) localStorage.setItem(SCOPE_KEY, JSON.stringify(scope));
    else localStorage.removeItem(SCOPE_KEY);
  }, [scope, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const trimmed = messages.slice(-80);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  }, [messages, hydrated]);

  const currentMode = getMode(mode);

  const handleModeChange = (m: ModeId) => {
    const def = MODES.find((x) => x.id === m);
    if (def?.requiresScope && !scope) {
      setShowGate(true);
      return;
    }
    setMode(m);
  };

  const send = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;

    const currentDef = MODES.find((m) => m.id === mode);
    if (currentDef?.requiresScope && !scope) {
      setShowGate(true);
      return;
    }

    const userMsg: ChatMessage = { role: "user", content: text, timestamp: Date.now() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);
    setStreaming("");

    try {
      const res = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          messages: next.map(({ role, content }) => ({ role, content })),
          scope,
        }),
      });
      if (!res.ok || !res.body) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";
      let errored = false;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // Parse SSE events from buffer
        let idx: number;
        while ((idx = buffer.indexOf("\n\n")) >= 0) {
          const chunk = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);
          const lines = chunk.split("\n");
          let eventName = "message";
          let dataLine = "";
          for (const ln of lines) {
            if (ln.startsWith("event:")) eventName = ln.slice(6).trim();
            else if (ln.startsWith("data:")) dataLine = ln.slice(5).trim();
          }
          if (!dataLine) continue;
          try {
            const payload = JSON.parse(dataLine);
            if (eventName === "delta" && typeof payload.text === "string") {
              accumulated += payload.text;
              setStreaming(accumulated);
            } else if (eventName === "error") {
              errored = true;
              accumulated = `Error: ${payload.message ?? "stream error"}`;
              setStreaming(accumulated);
            }
          } catch {
            // ignore malformed SSE chunk
          }
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: accumulated || (errored ? "(error)" : "(empty)"),
          timestamp: Date.now(),
        },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${msg}`, timestamp: Date.now() },
      ]);
    } finally {
      setStreaming("");
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setInput("");
  };

  const exportSession = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          { exportedAt: new Date().toISOString(), scope, mode, phase, messages },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rt-session-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800 bg-neutral-900/80 backdrop-blur">
        <div className="max-w-7xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600/10 border border-red-700/40 rounded">
              <Shield className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Red Team AI Agent</h1>
              <p className="text-xs text-neutral-400">
                Recon · OSINT · Internal Pentest · Reporting — Anthropic-powered
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/findings"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded text-xs transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              Findings
            </Link>
            <button
              onClick={exportSession}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded text-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export session
            </button>
            <button
              onClick={clearChat}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded text-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear chat
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        {scope ? (
          <ScopeBanner scope={scope} onClear={() => setScope(null)} />
        ) : (
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 mb-4 flex items-center justify-between">
            <p className="text-xs text-neutral-400">
              <span className="text-neutral-200 font-medium">No engagement scope set.</span>{" "}
              OSINT, Reporting and Defense are open. Active modes require scope.
            </p>
            <button
              onClick={() => setShowGate(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded text-xs font-medium transition-colors"
            >
              Define scope
            </button>
          </div>
        )}

        <PhaseTimeline current={phase} onSelect={setPhase} />
        <ModeSelector current={mode} onSelect={handleModeChange} scope={scope} />

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 mb-4">
          <h2 className="text-sm font-semibold text-neutral-100">{currentMode.name}</h2>
          <p className="text-xs text-neutral-400 mt-1">{currentMode.description}</p>
        </div>

        <QuickActions mode={mode} onPick={(p) => send(p)} disabled={loading} />

        <ChatPanel
          messages={messages}
          input={input}
          setInput={setInput}
          loading={loading}
          streamingContent={streaming}
          placeholder={`Ask about ${currentMode.name.toLowerCase()}... (Shift+Enter for newline)`}
          onSend={() => send()}
        />

        <div className="mt-4 bg-red-900/20 border border-red-700/40 rounded-lg p-3">
          <p className="text-[11px] text-red-200/90 leading-relaxed">
            <span className="font-semibold">Legal notice:</span> This tool is for{" "}
            <span className="font-semibold">authorized</span> security testing only.
            Unauthorized access to computer systems is illegal in most jurisdictions
            (CFAA / IT Act / Computer Misuse Act). Document your authorization, work
            within scope, and follow responsible-disclosure norms.
          </p>
        </div>
      </main>

      {showGate && (
        <AuthorizationGate
          onAccept={(s) => {
            setScope(s);
            setShowGate(false);
          }}
        />
      )}
    </div>
  );
}
