"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy } from "lucide-react";

interface Props {
  content: string;
}

function CodeBlock({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <div className="relative my-2 group">
      <button
        onClick={copy}
        title="Copy"
        className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded px-1.5 py-0.5 text-[10px] flex items-center gap-1"
      >
        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        {copied ? "Copied" : "Copy"}
      </button>
      <pre className="bg-neutral-950 border border-neutral-800 rounded p-3 overflow-x-auto text-[12.5px] leading-relaxed">
        <code className="font-mono text-neutral-200">{value}</code>
      </pre>
    </div>
  );
}

export default function MarkdownView({ content }: Props) {
  return (
    <div className="prose-rt text-sm leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p({ children }) {
            return <p className="my-2 first:mt-0 last:mb-0">{children}</p>;
          },
          h1({ children }) {
            return <h1 className="text-base font-bold mt-3 mb-1.5">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-sm font-bold mt-3 mb-1.5">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-sm font-semibold mt-2 mb-1">{children}</h3>;
          },
          ul({ children }) {
            return <ul className="list-disc list-outside pl-5 my-1.5 space-y-0.5">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal list-outside pl-5 my-1.5 space-y-0.5">{children}</ol>;
          },
          li({ children }) {
            return <li className="my-0">{children}</li>;
          },
          a({ children, href }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
              >
                {children}
              </a>
            );
          },
          strong({ children }) {
            return <strong className="font-semibold text-neutral-50">{children}</strong>;
          },
          em({ children }) {
            return <em className="text-neutral-200">{children}</em>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-2 border-neutral-600 pl-3 my-2 italic text-neutral-300">
                {children}
              </blockquote>
            );
          },
          hr() {
            return <hr className="my-3 border-neutral-700" />;
          },
          table({ children }) {
            return (
              <div className="my-2 overflow-x-auto">
                <table className="text-xs border-collapse border border-neutral-700">{children}</table>
              </div>
            );
          },
          th({ children }) {
            return <th className="border border-neutral-700 px-2 py-1 bg-neutral-800 text-left">{children}</th>;
          },
          td({ children }) {
            return <td className="border border-neutral-700 px-2 py-1 align-top">{children}</td>;
          },
          code({ className, children, ...props }) {
            const value = String(children).replace(/\n$/, "");
            // Heuristic: block code blocks have language- className or contain a newline.
            const isBlock = /language-/.test(className ?? "") || value.includes("\n");
            if (!isBlock) {
              return (
                <code className="bg-neutral-800 border border-neutral-700 rounded px-1 py-px text-[12px] font-mono" {...props}>
                  {value}
                </code>
              );
            }
            return <CodeBlock value={value} />;
          },
          pre({ children }) {
            return <>{children}</>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
