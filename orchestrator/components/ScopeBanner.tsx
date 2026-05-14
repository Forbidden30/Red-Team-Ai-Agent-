"use client";

import { ShieldCheck, X } from "lucide-react";
import type { Scope } from "@/lib/types";

interface Props {
  scope: Scope;
  onClear: () => void;
}

export default function ScopeBanner({ scope, onClear }: Props) {
  return (
    <div className="bg-emerald-900/20 border border-emerald-700/40 rounded-lg p-3 mb-4 flex items-start justify-between gap-3">
      <div className="flex items-start gap-2 text-xs">
        <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="text-emerald-300 font-medium">{scope.engagement}</span>
          <span className="text-neutral-400"> — authorized by {scope.authorizedBy}, </span>
          <span className="text-neutral-300">
            {scope.authorizedTargets.length} target{scope.authorizedTargets.length === 1 ? "" : "s"}
          </span>
          {scope.outOfScope.length > 0 && (
            <span className="text-neutral-400">
              {" "}({scope.outOfScope.length} out-of-scope rule
              {scope.outOfScope.length === 1 ? "" : "s"})
            </span>
          )}
        </div>
      </div>
      <button
        onClick={onClear}
        title="Clear scope"
        className="text-neutral-500 hover:text-neutral-300 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
