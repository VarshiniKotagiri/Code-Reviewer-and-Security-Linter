"use client";

import React, { useState } from "react";
import { Issue } from "@/types/analysis";
import { getSeverityStyles } from "@/lib/utils";
import { TooltipBadge } from "./TooltipBadge";
import {
  ShieldAlert,
  Bug,
  Zap,
  Sparkles,
  ChevronDown,
  ChevronUp,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface IssueCardProps {
  issue: Issue;
  isSelected?: boolean;
  onSelectLine: (start: number, end: number) => void;
}

export function IssueCard({
  issue,
  isSelected,
  onSelectLine,
}: IssueCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const styles = getSeverityStyles(issue.severity);

  const getCategoryIcon = () => {
    switch (issue.category) {
      case "security":
        return <ShieldAlert className="w-4 h-4 text-red-400" />;
      case "bug":
        return <Bug className="w-4 h-4 text-yellow-400" />;
      case "performance":
        return <Zap className="w-4 h-4 text-cyan-400" />;
      case "style":
      default:
        return <Sparkles className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div
      onClick={() => onSelectLine(issue.lineStart, issue.lineEnd)}
      className={`group relative rounded-xl p-4 transition-all duration-200 cursor-pointer border bg-zinc-900/70 hover:bg-zinc-900 shadow-md ${
        isSelected
          ? "border-emerald-500/80 ring-2 ring-emerald-500/30"
          : styles.cardBorder
      }`}
    >
      {/* Header bar */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Icon */}
          <span className="p-1.5 rounded-lg bg-zinc-800/80 border border-zinc-700/60">
            {getCategoryIcon()}
          </span>

          {/* Severity Badge with Tooltip */}
          <TooltipBadge
            term={issue.severity}
            badgeLabel={issue.severity.toUpperCase()}
            badgeClass={`${styles.badgeBg} ${styles.badgeText} ${styles.badgeBorder}`}
          />

          {/* CWE Tag */}
          {issue.cwe && (
            <TooltipBadge
              term={issue.cwe}
              badgeLabel={issue.cwe}
              badgeClass="bg-zinc-800 text-cyan-300 border-cyan-800/40"
              showIcon
            />
          )}

          {/* OWASP Tag */}
          {issue.owasp && (
            <TooltipBadge
              term="owasp"
              customTitle={issue.owasp}
              badgeLabel={issue.owasp}
              badgeClass="bg-zinc-800 text-purple-300 border-purple-800/40"
            />
          )}

          {/* Line locator pill */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectLine(issue.lineStart, issue.lineEnd);
            }}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono text-zinc-400 bg-zinc-800/80 hover:bg-zinc-700/80 hover:text-zinc-200 border border-zinc-700 transition-colors"
            title="Click to jump and highlight in editor"
          >
            <MapPin className="w-3 h-3 text-emerald-400" />
            <span>
              {issue.lineStart === issue.lineEnd
                ? `L${issue.lineStart}`
                : `L${issue.lineStart}–L${issue.lineEnd}`}
            </span>
          </button>
        </div>

        {/* Toggle Collapse */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="text-zinc-500 hover:text-zinc-300 p-1 rounded-lg"
          aria-label={isExpanded ? "Collapse issue details" : "Expand issue details"}
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Issue Title */}
      <h3 className="text-sm font-semibold text-zinc-100 mt-2.5 leading-snug">
        {issue.title}
      </h3>

      {isExpanded && (
        <div className="mt-3 space-y-3 pt-2.5 border-t border-zinc-800/80 text-xs">
          {/* Explanation */}
          <div>
            <span className="font-semibold text-zinc-400 block mb-1">
              Explanation:
            </span>
            <p className="text-zinc-300 leading-relaxed">{issue.explanation}</p>
          </div>

          {/* Why It Matters */}
          <div className="p-2.5 rounded-lg bg-red-950/20 border border-red-900/30">
            <div className="flex items-center gap-1.5 text-red-400 font-semibold mb-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Why It Matters:</span>
            </div>
            <p className="text-zinc-300 leading-relaxed">{issue.whyItMatters}</p>
          </div>

          {/* Fix Recommendation */}
          <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/30">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Recommended Fix:</span>
            </div>
            <p className="text-zinc-300 leading-relaxed font-sans">{issue.fix}</p>
          </div>
        </div>
      )}
    </div>
  );
}
