"use client";

import { MODES } from "@/lib/modes";
import type { ModeId, Scope } from "@/lib/types";
import { Lock } from "lucide-react";

interface Props {
  current: ModeId;
  onSelect: (m: ModeId) => void;
  scope: Scope | null;
}

export default function ModeSelector({ current, onSelect, scope }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
      {MODES.map((m) => {
        const Icon = m.icon;
        const locked = m.requiresScope && !scope;
        const isActive = current === m.id;
        return (
          <button
            key={m.id}
            onClick={() => !locked && onSelect(m.id)}
            disabled={locked}
            title={locked ? "Requires accepted engagement scope" : m.description}
            className={`p-3 rounded-lg border-2 transition-all text-left ${
              isActive
                ? `border-${m.color}-500 bg-${m.color}-500/10`
                : "border-neutral-800 bg-neutral-900 hover:border-neutral-700"
            } ${locked ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <Icon className={`w-5 h-5 text-${m.color}-400`} />
              {locked && <Lock className="w-3.5 h-3.5 text-neutral-500" />}
            </div>
            <div className="text-xs font-semibold text-neutral-100">{m.name}</div>
            <div className="text-[10px] text-neutral-500 mt-0.5">{m.short}</div>
          </button>
        );
      })}
    </div>
  );
}
