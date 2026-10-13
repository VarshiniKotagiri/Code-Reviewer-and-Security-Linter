"use client";

import React from "react";
import { SavedReview } from "@/types/analysis";
import { getScoreDetails, formatDate } from "@/lib/utils";
import { X, History, Trash2, ArrowRight, ShieldAlert, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  reviews: SavedReview[];
  isLoading: boolean;
  onSelectReview: (review: SavedReview) => void;
  onDeleteReview: (id: string) => void;
}

export function HistorySidebar({
  isOpen,
  onClose,
  reviews,
  isLoading,
  onSelectReview,
  onDeleteReview,
}: HistorySidebarProps) {
  const { showToast } = useToast();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-400" />
              <h2 className="text-sm font-semibold text-zinc-100">
                Audit History
              </h2>
              <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full border border-zinc-700">
                {reviews.length}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-100 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
              aria-label="Close history drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-500 gap-2">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Fetching past reviews...</span>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-2">
                <History className="w-10 h-10 text-zinc-700 mx-auto" />
                <p className="text-sm font-medium text-zinc-400">
                  No audit history yet
                </p>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                  Analyze your code snippets and each audit result will be automatically saved to your browser session.
                </p>
              </div>
            ) : (
              reviews.map((rev) => {
                const details = getScoreDetails(rev.score);
                const issueCount = rev.result?.issues?.length || 0;

                return (
                  <div
                    key={rev.id}
                    className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col gap-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {rev.language}
                        </span>
                        <span className="text-[11px] text-zinc-500">
                          {formatDate(rev.created_at)}
                        </span>
                      </div>

                      {/* Score Badge */}
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold font-mono border ${details.bgClass} ${details.colorClass} ${details.borderClass}`}
                      >
                        {rev.score}/100
                      </span>
                    </div>

                    {/* Preview snippet */}
                    <div className="p-2 rounded bg-zinc-950 font-mono text-[11px] text-zinc-400 overflow-hidden line-clamp-2 select-none border border-zinc-900">
                      {rev.code.slice(0, 120)}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                        {issueCount === 0 ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            Clean code
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                            {issueCount} issue{issueCount > 1 ? "s" : ""}
                          </>
                        )}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteReview(rev.id);
                            showToast("Review deleted.", "info");
                          }}
                          className="p-1 text-zinc-500 hover:text-red-400 rounded transition-colors"
                          title="Delete review"
                          aria-label="Delete review"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onSelectReview(rev);
                            onClose();
                            showToast("Review reloaded from history.", "success");
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 transition-colors"
                        >
                          <span>Load</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
