"use client";

import React, { useState } from "react";
import { diffLines, Change } from "diff";
import { Copy, Check, Split, AlignJustify, ArrowRight, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface DiffViewerProps {
  originalCode: string;
  refactoredCode: string;
  refactorNotes?: string;
  language?: string;
  onApplyRefactor?: (newCode: string) => void;
}

export function DiffViewer({
  originalCode,
  refactoredCode,
  refactorNotes,
  language = "plaintext",
  onApplyRefactor,
}: DiffViewerProps) {
  const [viewMode, setViewMode] = useState<"diff-unified" | "diff-split" | "refactored-only">(
    "diff-split"
  );
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(refactoredCode);
      setCopied(true);
      showToast("Refactored code copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("Failed to copy code to clipboard.", "error");
    }
  };

  // Compute diff chunks
  const diffChunks = diffLines(originalCode || "", refactoredCode || "");

  // Separate chunks for side-by-side split view
  const originalLines: { text: string; type: "normal" | "removed" | "empty" }[] = [];
  const refactoredLines: { text: string; type: "normal" | "added" | "empty" }[] = [];

  diffChunks.forEach((part: Change) => {
    const lines = part.value.split("\n");
    if (lines[lines.length - 1] === "") {
      lines.pop(); // Remove trailing empty string from split
    }

    if (part.added) {
      lines.forEach((l) => refactoredLines.push({ text: l, type: "added" }));
    } else if (part.removed) {
      lines.forEach((l) => originalLines.push({ text: l, type: "removed" }));
    } else {
      lines.forEach((l) => {
        originalLines.push({ text: l, type: "normal" });
        refactoredLines.push({ text: l, type: "normal" });
      });
    }
  });

  return (
    <div className="flex flex-col h-full rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl overflow-hidden">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-zinc-200">
            Refactored Code & Diff
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60">
            {language}
          </span>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-zinc-800 rounded-lg p-0.5 border border-zinc-700 ml-2">
            <button
              type="button"
              onClick={() => setViewMode("diff-split")}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                viewMode === "diff-split"
                  ? "bg-zinc-700 text-zinc-100 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Split className="w-3 h-3" />
              <span>Side-by-Side</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("diff-unified")}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                viewMode === "diff-unified"
                  ? "bg-zinc-700 text-zinc-100 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <AlignJustify className="w-3 h-3" />
              <span>Unified</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("refactored-only")}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                viewMode === "refactored-only"
                  ? "bg-zinc-700 text-zinc-100 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <span>Clean Code Only</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Apply to Editor Button */}
          {onApplyRefactor && (
            <button
              type="button"
              onClick={() => {
                onApplyRefactor(refactoredCode);
                showToast("Refactored code loaded into editor!", "info");
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Apply to Editor</span>
            </button>
          )}

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{copied ? "Copied" : "Copy Code"}</span>
          </button>
        </div>
      </div>

      {/* Code Viewer Body */}
      <div className="flex-1 overflow-auto max-h-[500px] font-mono text-xs p-3 bg-zinc-950 scrollbar-thin">
        {viewMode === "diff-split" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Original / Red Column */}
            <div className="border border-red-950/40 rounded-xl overflow-hidden bg-zinc-900/40">
              <div className="px-3 py-1.5 bg-red-950/30 border-b border-red-900/40 text-[11px] font-semibold text-red-400">
                Original (Vulnerable / Dirty)
              </div>
              <div className="p-2 space-y-0.5">
                {originalLines.map((line, idx) => (
                  <div
                    key={`orig-${idx}`}
                    className={`flex items-start px-2 py-0.5 rounded leading-relaxed ${
                      line.type === "removed"
                        ? "bg-red-950/60 text-red-300 line-through decoration-red-500/70"
                        : "text-zinc-400"
                    }`}
                  >
                    <span className="w-7 select-none text-zinc-600 text-right pr-2 shrink-0">
                      {idx + 1}
                    </span>
                    <span className="whitespace-pre-wrap break-all flex-1">
                      {line.text || " "}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Refactored / Green Column */}
            <div className="border border-emerald-950/40 rounded-xl overflow-hidden bg-zinc-900/40">
              <div className="px-3 py-1.5 bg-emerald-950/30 border-b border-emerald-900/40 text-[11px] font-semibold text-emerald-400">
                Refactored (Secure / Idiomatic)
              </div>
              <div className="p-2 space-y-0.5">
                {refactoredLines.map((line, idx) => (
                  <div
                    key={`refact-${idx}`}
                    className={`flex items-start px-2 py-0.5 rounded leading-relaxed ${
                      line.type === "added"
                        ? "bg-emerald-950/60 text-emerald-300 font-medium"
                        : "text-zinc-400"
                    }`}
                  >
                    <span className="w-7 select-none text-zinc-600 text-right pr-2 shrink-0">
                      {idx + 1}
                    </span>
                    <span className="whitespace-pre-wrap break-all flex-1">
                      {line.text || " "}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {viewMode === "diff-unified" && (
          <div className="space-y-0.5 border border-zinc-800 rounded-xl p-2 bg-zinc-900/30">
            {diffChunks.map((chunk, chunkIdx) => {
              const lines = chunk.value.split("\n");
              if (lines[lines.length - 1] === "") lines.pop();

              return lines.map((line, lineIdx) => {
                let rowBg = "text-zinc-400";
                let prefix = " ";
                if (chunk.added) {
                  rowBg = "bg-emerald-950/50 text-emerald-300";
                  prefix = "+";
                } else if (chunk.removed) {
                  rowBg = "bg-red-950/50 text-red-300 line-through";
                  prefix = "-";
                }

                return (
                  <div
                    key={`unified-${chunkIdx}-${lineIdx}`}
                    className={`flex items-start px-2 py-0.5 rounded leading-relaxed ${rowBg}`}
                  >
                    <span className="w-4 select-none font-bold shrink-0">
                      {prefix}
                    </span>
                    <span className="whitespace-pre-wrap break-all flex-1">
                      {line || " "}
                    </span>
                  </div>
                );
              });
            })}
          </div>
        )}

        {viewMode === "refactored-only" && (
          <pre className="p-3 bg-zinc-900/40 rounded-xl text-emerald-300 whitespace-pre-wrap font-mono leading-relaxed border border-emerald-950/50">
            {refactoredCode}
          </pre>
        )}
      </div>

      {/* Refactor Notes Section */}
      {refactorNotes && (
        <div className="p-4 bg-zinc-900/90 border-t border-zinc-800">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
            Refactoring Notes & Justifications:
          </span>
          <p className="text-xs text-zinc-300 whitespace-pre-line leading-relaxed">
            {refactorNotes}
          </p>
        </div>
      )}
    </div>
  );
}
