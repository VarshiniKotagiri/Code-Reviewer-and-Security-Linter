"use client";

import React from "react";
import { AnalysisResult } from "@/types/analysis";
import { ScoreBadge } from "./ScoreBadge";
import { ShieldAlert, Bug, Zap, Sparkles } from "lucide-react";

interface SummaryBannerProps {
  result: AnalysisResult;
  selectedFilter: string;
  onSelectFilter: (filter: string) => void;
}

export function SummaryBanner({
  result,
  selectedFilter,
  onSelectFilter,
}: SummaryBannerProps) {
  const issues = result.issues || [];

  const counts = {
    total: issues.length,
    critical: issues.filter((i) => i.severity === "critical").length,
    high: issues.filter((i) => i.severity === "high").length,
    medium: issues.filter((i) => i.severity === "medium").length,
    low: issues.filter((i) => i.severity === "low").length,
    info: issues.filter((i) => i.severity === "info").length,
    security: issues.filter((i) => i.category === "security").length,
    bug: issues.filter((i) => i.category === "bug").length,
    performance: issues.filter((i) => i.category === "performance").length,
    style: issues.filter((i) => i.category === "style").length,
  };

  return (
    <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xl space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <ScoreBadge score={result.overallScore} />

        <div className="flex-1 md:border-l md:border-zinc-800 md:pl-5">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
            Audit Executive Summary
          </h2>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {result.summary}
          </p>
        </div>
      </div>

      {/* Filter and Category Pills */}
      <div className="pt-3 border-t border-zinc-800/80 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-zinc-500 mr-1">Filter:</span>

        <button
          type="button"
          onClick={() => onSelectFilter("all")}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
            selectedFilter === "all"
              ? "bg-zinc-100 text-zinc-900 font-semibold"
              : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
          }`}
        >
          All ({counts.total})
        </button>

        {counts.critical > 0 && (
          <button
            type="button"
            onClick={() => onSelectFilter("critical")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              selectedFilter === "critical"
                ? "bg-red-500 text-white font-semibold"
                : "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
            }`}
          >
            Critical ({counts.critical})
          </button>
        )}

        {counts.high > 0 && (
          <button
            type="button"
            onClick={() => onSelectFilter("high")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              selectedFilter === "high"
                ? "bg-orange-500 text-white font-semibold"
                : "bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20"
            }`}
          >
            High ({counts.high})
          </button>
        )}

        {counts.medium > 0 && (
          <button
            type="button"
            onClick={() => onSelectFilter("medium")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              selectedFilter === "medium"
                ? "bg-yellow-500 text-zinc-900 font-semibold"
                : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/20"
            }`}
          >
            Medium ({counts.medium})
          </button>
        )}

        {counts.security > 0 && (
          <button
            type="button"
            onClick={() => onSelectFilter("security")}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              selectedFilter === "security"
                ? "bg-red-600 text-white font-semibold"
                : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            Security ({counts.security})
          </button>
        )}

        {counts.performance > 0 && (
          <button
            type="button"
            onClick={() => onSelectFilter("performance")}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              selectedFilter === "performance"
                ? "bg-cyan-600 text-white font-semibold"
                : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            Performance ({counts.performance})
          </button>
        )}

        {counts.bug > 0 && (
          <button
            type="button"
            onClick={() => onSelectFilter("bug")}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              selectedFilter === "bug"
                ? "bg-yellow-600 text-white font-semibold"
                : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Bug className="w-3.5 h-3.5 text-yellow-400" />
            Bugs ({counts.bug})
          </button>
        )}

        {counts.style > 0 && (
          <button
            type="button"
            onClick={() => onSelectFilter("style")}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              selectedFilter === "style"
                ? "bg-purple-600 text-white font-semibold"
                : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Style ({counts.style})
          </button>
        )}
      </div>
    </div>
  );
}
