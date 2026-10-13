"use client";

import React from "react";
import { getScoreDetails } from "@/lib/utils";
import { ShieldAlert, ShieldCheck, AlertTriangle } from "lucide-react";

interface ScoreBadgeProps {
  score: number;
}

export function ScoreBadge({ score }: ScoreBadgeProps) {
  const details = getScoreDetails(score);
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 shadow-lg">
      <div className="relative flex items-center justify-center shrink-0 w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            className="stroke-zinc-800"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={details.strokeColor}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-2xl font-bold font-mono text-zinc-100">
            {score}
          </span>
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider">
            / 100
          </span>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          {score >= 90 ? (
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          ) : score >= 70 ? (
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-red-400" />
          )}
          <span className={`text-base font-semibold ${details.colorClass}`}>
            {details.label}
          </span>
        </div>
        <p className="text-xs text-zinc-400 mt-1 max-w-xs leading-relaxed">
          {score >= 90
            ? "Code adheres to standard security patterns and idiomatic conventions."
            : score >= 70
            ? "Minor vulnerabilities or anti-patterns detected. Review recommended."
            : score >= 40
            ? "Significant security flaws or performance bottlenecks detected."
            : "Critical security vulnerabilities detected. Do not deploy to production!"}
        </p>
      </div>
    </div>
  );
}
