"use client";

import { Search, Radar, AlertTriangle, Network, FileText } from "lucide-react";

export type Phase = "recon" | "collect" | "test" | "exploit" | "report";

export const PHASES: { id: Phase; name: string; icon: typeof Search }[] = [
  { id: "recon", name: "Recon", icon: Radar },
  { id: "collect", name: "Collect", icon: Search },
  { id: "test", name: "Test", icon: AlertTriangle },
  { id: "exploit", name: "Exploit + OSINT", icon: Network },
  { id: "report", name: "Report", icon: FileText },
];

interface Props {
  current: Phase;
  onSelect: (p: Phase) => void;
}

export default function PhaseTimeline({ current, onSelect }: Props) {
  const idx = PHASES.findIndex((p) => p.id === current);
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between gap-2">
        {PHASES.map((p, i) => {
          const Icon = p.icon;
          const isDone = i < idx;
          const isActive = i === idx;
          return (
            <div key={p.id} className="flex items-center flex-1">
              <button
                onClick={() => onSelect(p.id)}
                className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded transition-colors flex-1 ${
                  isActive
                    ? "bg-blue-500/10 text-blue-300"
                    : isDone
                    ? "text-emerald-400"
                    : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] uppercase tracking-wide font-medium">
                  {p.name}
                </span>
              </button>
              {i < PHASES.length - 1 && (
                <div
                  className={`h-px flex-1 mx-1 ${
                    isDone ? "bg-emerald-700" : "bg-neutral-800"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
