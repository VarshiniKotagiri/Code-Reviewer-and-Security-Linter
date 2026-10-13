"use client";

import React, { useState, useRef, useEffect } from "react";
import { CWE_GLOSSARY, JARGON_GLOSSARY } from "@/lib/constants/cwe-glossary";
import { Info } from "lucide-react";

interface TooltipBadgeProps {
  term?: string;
  customTitle?: string;
  customExplanation?: string;
  badgeLabel: string;
  badgeClass?: string;
  showIcon?: boolean;
}

export function TooltipBadge({
  term,
  customTitle,
  customExplanation,
  badgeLabel,
  badgeClass = "bg-zinc-800 text-zinc-300 border-zinc-700",
  showIcon = false,
}: TooltipBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Look up glossary
  const normalizedKey = term?.toUpperCase() || "";
  const cweData = CWE_GLOSSARY[normalizedKey];
  const jargonDef = term ? JARGON_GLOSSARY[term.toLowerCase()] : undefined;

  const title = customTitle || cweData?.title || term;
  const description =
    customExplanation ||
    cweData?.definition ||
    jargonDef ||
    "Educational security reference";
  const impact = cweData?.impact;

  // Handle outside click to close popover on tap
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono font-medium border transition-colors cursor-pointer ${badgeClass}`}
        aria-label={`Explain ${badgeLabel}`}
      >
        <span>{badgeLabel}</span>
        {showIcon && <Info className="w-3 h-3 opacity-70" />}
      </button>

      {isOpen && (
        <div
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 rounded-xl bg-zinc-900 border border-zinc-700/80 shadow-2xl text-left text-xs text-zinc-300 animate-in fade-in zoom-in-95 pointer-events-auto"
        >
          <div className="flex items-center justify-between pb-1 mb-1 border-b border-zinc-800">
            <span className="font-semibold text-zinc-100">{title}</span>
            <span className="text-[10px] text-zinc-500 uppercase font-mono">
              Guide
            </span>
          </div>
          <p className="leading-relaxed text-zinc-300">{description}</p>
          {impact && (
            <div className="mt-2 pt-1.5 border-t border-zinc-800/60">
              <span className="text-[10px] font-semibold text-red-400 block mb-0.5">
                Real-world Impact:
              </span>
              <p className="text-[11px] text-zinc-400 leading-snug">{impact}</p>
            </div>
          )}
          <div className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-3 h-3 bg-zinc-900 border-r border-b border-zinc-700/80 rotate-45" />
        </div>
      )}
    </div>
  );
}
