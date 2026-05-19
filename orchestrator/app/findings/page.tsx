"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Folder,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
} from "lucide-react";
import MarkdownView from "@/components/MarkdownView";

interface Engagement {
  name: string;
  path: string;
  scope?: {
    engagement?: string;
    authorized_by?: string;
    authorized_targets?: string[];
  };
  counts: { findings: number; artifacts: number; reports: number; events: number };
}

interface Finding {
  id: string;
  file: string;
  title: string;
  severity?: string;
  class?: string;
  status?: string;
  affectedAsset?: string;
}

interface EngagementDetail extends Engagement {
  findings: Finding[];
  intel?: string | null;
  notes?: string | null;
}

const SEV_COLOR: Record<string, string> = {
  Critical: "text-red-300 border-red-700 bg-red-500/10",
  High: "text-orange-300 border-orange-700 bg-orange-500/10",
  Medium: "text-yellow-300 border-yellow-700 bg-yellow-500/10",
  Low: "text-blue-300 border-blue-700 bg-blue-500/10",
  Info: "text-neutral-300 border-neutral-700 bg-neutral-500/10",
};

export default function FindingsPage() {
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<EngagementDetail | null>(null);
  const [findingContent, setFindingContent] = useState<{ file: string; content: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/engagements")
      .then((r) => r.json())
      .then((d) => setEngagements(d.engagements ?? []))
      .catch((e) => setError(String(e)));
  }, []);

  useEffect(() => {
    if (!selected) {
      setDetail(null);
      return;
    }
    setLoading(true);
    fetch(`/api/engagements/${encodeURIComponent(selected)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setDetail(d);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
    setFindingContent(null);
  }, [selected]);

  const openFinding = (file: string) => {
    if (!selected) return;
    fetch(`/api/engagements/${encodeURIComponent(selected)}/findings/${encodeURIComponent(file)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.content) setFindingContent({ file, content: d.content });
        else if (d.error) setError(d.error);
      });
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800 bg-neutral-900/80 backdrop-blur">
        <div className="max-w-7xl mx-auto p-4 flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-2 py-1 text-xs text-neutral-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Chat
          </Link>
          <div className="h-5 w-px bg-neutral-700" />
          <div>
            <h1 className="text-lg font-bold tracking-tight">Findings</h1>
            <p className="text-xs text-neutral-400">
              Engagement workspaces under <code className="bg-neutral-800 px-1 rounded">agent/engagements/</code>
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 grid grid-cols-1 md:grid-cols-[260px_1fr_1fr] gap-4">
        {/* Engagements list */}
        <aside className="bg-neutral-900 border border-neutral-800 rounded-lg p-3">
          <h2 className="text-xs font-semibold text-neutral-300 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Folder className="w-3.5 h-3.5" />
            Engagements ({engagements.length})
          </h2>
          {engagements.length === 0 && (
            <div className="text-xs text-neutral-500 mt-2 space-y-2">
              <p>
                None yet. Run <code className="bg-neutral-800 px-1 rounded">bin/rt-agent engage &lt;name&gt;</code> from the repo root.
              </p>
              <p className="text-neutral-600 italic">
                Engagements are filesystem-backed under{" "}
                <code className="bg-neutral-800 px-1 rounded">agent/engagements/</code>{" "}
                and only visible when running locally.
              </p>
            </div>
          )}
          <ul className="space-y-1">
            {engagements.map((e) => (
              <li key={e.name}>
                <button
                  onClick={() => setSelected(e.name)}
                  className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${
                    selected === e.name
                      ? "bg-blue-500/10 border border-blue-700/40 text-blue-200"
                      : "hover:bg-neutral-800 text-neutral-300 border border-transparent"
                  }`}
                >
                  <div className="font-medium truncate">{e.name}</div>
                  <div className="text-[10px] text-neutral-500">
                    {e.counts.findings} findings · {e.counts.events} events
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Findings list */}
        <section className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 min-h-[400px]">
          <h2 className="text-xs font-semibold text-neutral-300 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
            Findings
            {detail && <span className="text-neutral-500">— {detail.findings.length}</span>}
          </h2>
          {!selected && (
            <div className="text-xs text-neutral-500 mt-4">Pick an engagement.</div>
          )}
          {loading && <div className="text-xs text-neutral-500">Loading...</div>}
          {error && <div className="text-xs text-red-400">Error: {error}</div>}
          {detail && (
            <>
              {detail.findings.length === 0 && (
                <div className="text-xs text-neutral-500 mt-4">
                  No findings yet. Run{" "}
                  <code className="bg-neutral-800 px-1 rounded">
                    bin/rt-agent finding &quot;Title&quot; High
                  </code>.
                </div>
              )}
              <ul className="space-y-1">
                {detail.findings.map((f) => (
                  <li key={f.file}>
                    <button
                      onClick={() => openFinding(f.file)}
                      className={`w-full text-left px-2 py-2 rounded text-xs transition-colors group ${
                        findingContent?.file === f.file
                          ? "bg-blue-500/10 border border-blue-700/40"
                          : "hover:bg-neutral-800 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium truncate">
                          <span className="text-neutral-500 mr-1.5">{f.id}</span>
                          {f.title}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-600 group-hover:text-neutral-300" />
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        {f.severity && (
                          <span
                            className={`px-1.5 py-0.5 rounded border text-[10px] ${
                              SEV_COLOR[f.severity] ?? SEV_COLOR.Info
                            }`}
                          >
                            {f.severity}
                          </span>
                        )}
                        {f.class && (
                          <span className="text-[10px] text-neutral-400">{f.class}</span>
                        )}
                        {f.status === "Resolved" && (
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        {/* Finding viewer */}
        <section className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 min-h-[400px] overflow-x-auto">
          <h2 className="text-xs font-semibold text-neutral-300 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            {findingContent ? findingContent.file : "Viewer"}
          </h2>
          {!findingContent && (
            <div className="text-xs text-neutral-500">Pick a finding to view.</div>
          )}
          {findingContent && (
            <article className="text-neutral-100">
              <MarkdownView content={findingContent.content} />
            </article>
          )}
        </section>
      </main>
    </div>
  );
}
