"use client";

import React from "react";
import { SAMPLE_SNIPPETS, SampleSnippet } from "@/lib/constants/sample-snippets";
import { ShieldAlert, CheckCircle2 } from "lucide-react";

interface ExampleSelectorProps {
  onSelectSnippet: (snippet: SampleSnippet) => void;
  currentSnippetId?: string;
}

export function ExampleSelector({
  onSelectSnippet,
  currentSnippetId,
}: ExampleSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Preset Examples
        </span>
        <span className="text-[11px] text-zinc-500">
          Click to load & analyze
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {SAMPLE_SNIPPETS.map((snippet) => {
          const isSelected = currentSnippetId === snippet.id;
          const isClean = snippet.category === "clean";

          return (
            <button
              key={snippet.id}
              type="button"
              onClick={() => onSelectSnippet(snippet)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                isSelected
                  ? "bg-zinc-800 text-zinc-100 border-emerald-500/60 shadow-sm"
                  : isClean
                  ? "bg-emerald-950/20 text-emerald-300 border-emerald-800/40 hover:bg-emerald-900/30"
                  : "bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-100"
              }`}
              title={snippet.description}
            >
              {isClean ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              )}
              <span>{snippet.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
