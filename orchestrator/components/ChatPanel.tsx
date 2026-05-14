"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Copy, Check, User, Bot } from "lucide-react";
import type { ChatMessage } from "@/lib/types";
import MarkdownView from "./MarkdownView";

interface Props {
  messages: ChatMessage[];
  input: string;
  setInput: (v: string) => void;
  loading: boolean;
  placeholder: string;
  onSend: () => void;
  streamingContent?: string;
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() =>
        navigator.clipboard.writeText(value).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        })
      }
      title="Copy"
      className="opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700 rounded px-1.5 py-0.5 text-[10px] flex items-center gap-1 absolute top-1.5 right-1.5"
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export default function ChatPanel({
  messages,
  input,
  setInput,
  loading,
  placeholder,
  onSend,
  streamingContent,
}: Props) {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, streamingContent]);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg flex flex-col h-[600px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-center text-neutral-500">
            <Bot className="w-10 h-10 mb-3 opacity-50" />
            <p className="text-sm">Pick a quick prompt above or type your own.</p>
            <p className="text-xs mt-1">
              Stay within your authorized scope. All activity should be legal and documented.
            </p>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`group relative max-w-[88%] rounded-lg px-3 py-2 ${
                m.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-800 text-neutral-100 border border-neutral-700"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 text-[10px] uppercase tracking-wide text-neutral-400">
                {m.role === "user" ? (
                  <User className="w-3 h-3" />
                ) : (
                  <Bot className="w-3 h-3" />
                )}
                {m.role === "user" ? "You" : "Agent"}
              </div>
              {m.role === "user" ? (
                <div className="text-sm whitespace-pre-wrap leading-relaxed">{m.content}</div>
              ) : (
                <MarkdownView content={m.content} />
              )}
              <CopyButton value={m.content} />
            </div>
          </div>
        ))}

        {/* Streaming assistant bubble (in-progress response) */}
        {loading && streamingContent !== undefined && streamingContent.length > 0 && (
          <div className="flex justify-start">
            <div className="group relative max-w-[88%] rounded-lg px-3 py-2 bg-neutral-800 text-neutral-100 border border-neutral-700">
              <div className="flex items-center gap-1.5 mb-1 text-[10px] uppercase tracking-wide text-neutral-400">
                <Bot className="w-3 h-3" />
                Agent
                <span className="ml-2 inline-flex gap-1">
                  <span className="w-1 h-1 bg-neutral-500 rounded-full animate-bounce" />
                  <span className="w-1 h-1 bg-neutral-500 rounded-full animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1 h-1 bg-neutral-500 rounded-full animate-bounce [animation-delay:0.3s]" />
                </span>
              </div>
              <MarkdownView content={streamingContent} />
            </div>
          </div>
        )}

        {loading && (streamingContent === undefined || streamingContent.length === 0) && (
          <div className="flex justify-start">
            <div className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce [animation-delay:0.15s]" />
                <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce [animation-delay:0.3s]" />
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSend();
        }}
        className="border-t border-neutral-800 p-3 flex gap-2"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder={placeholder}
          rows={1}
          className="flex-1 bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm resize-none focus:border-blue-500 focus:outline-none"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-700 disabled:cursor-not-allowed rounded text-sm font-medium flex items-center gap-1.5 transition-colors"
        >
          <Send className="w-4 h-4" />
          Send
        </button>
      </form>
    </div>
  );
}
