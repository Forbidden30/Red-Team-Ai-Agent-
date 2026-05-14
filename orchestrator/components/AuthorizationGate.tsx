"use client";

import { useState } from "react";
import { ShieldAlert, Check } from "lucide-react";
import type { Scope } from "@/lib/types";

interface Props {
  onAccept: (scope: Scope) => void;
}

export default function AuthorizationGate({ onAccept }: Props) {
  const [engagement, setEngagement] = useState("");
  const [authorizedBy, setAuthorizedBy] = useState("");
  const [targets, setTargets] = useState("");
  const [oos, setOos] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const canSubmit =
    engagement.trim().length > 0 &&
    authorizedBy.trim().length > 0 &&
    targets.trim().length > 0 &&
    confirmed;

  const submit = () => {
    if (!canSubmit) return;
    onAccept({
      engagement: engagement.trim(),
      authorizedBy: authorizedBy.trim(),
      authorizedTargets: targets
        .split("\n")
        .map((t) => t.trim())
        .filter(Boolean),
      outOfScope: oos
        .split("\n")
        .map((t) => t.trim())
        .filter(Boolean),
      acceptedAt: Date.now(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/95 flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-2xl w-full bg-neutral-900 border border-red-700/50 rounded-lg p-6 my-8">
        <div className="flex items-start gap-3 mb-4">
          <ShieldAlert className="w-7 h-7 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="text-xl font-bold text-white">Engagement authorization required</h2>
            <p className="text-sm text-neutral-400 mt-1">
              Define the scope before unlocking active recon, vulnerability, and internal-pentest modes.
              This is a local guardrail — it does not replace your written authorization.
            </p>
          </div>
        </div>

        <div className="space-y-3 mt-5">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Engagement name
            </label>
            <input
              type="text"
              value={engagement}
              onChange={(e) => setEngagement(e.target.value)}
              placeholder="e.g. Acme Corp Q2 internal pentest"
              className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Authorized by (point of contact)
            </label>
            <input
              type="text"
              value={authorizedBy}
              onChange={(e) => setAuthorizedBy(e.target.value)}
              placeholder="Name & email of authorizer"
              className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              In-scope targets (one per line)
            </label>
            <textarea
              value={targets}
              onChange={(e) => setTargets(e.target.value)}
              rows={4}
              placeholder={"*.acme.example\n10.20.0.0/16\napi.acme.example"}
              className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Out of scope (one per line, optional)
            </label>
            <textarea
              value={oos}
              onChange={(e) => setOos(e.target.value)}
              rows={3}
              placeholder={"prod.payments.acme.example\n*.partner.example"}
              className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none"
            />
          </div>

          <label className="flex items-start gap-2 mt-4 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1"
            />
            <span className="text-xs text-neutral-300">
              I have written authorization for this engagement, the targets listed are within
              that authorization, and I will not act outside the documented scope.
            </span>
          </label>

          <button
            onClick={submit}
            disabled={!canSubmit}
            className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-neutral-700 disabled:cursor-not-allowed rounded text-sm font-medium transition-colors"
          >
            <Check className="w-4 h-4" />
            Accept scope and continue
          </button>
        </div>
      </div>
    </div>
  );
}
