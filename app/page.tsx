"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CodeEditor, HighlightRange } from "@/components/editor/CodeEditor";
import { DiffViewer } from "@/components/editor/DiffViewer";
import { ExampleSelector } from "@/components/editor/ExampleSelector";
import { SummaryBanner } from "@/components/results/SummaryBanner";
import { IssueCard } from "@/components/results/IssueCard";
import { HistorySidebar } from "@/components/history/HistorySidebar";
import { AnalysisSkeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { SAMPLE_SNIPPETS, SampleSnippet } from "@/lib/constants/sample-snippets";
import { AnalysisResult, SavedReview } from "@/types/analysis";
import { generateUUID } from "@/lib/utils";
import {
  ShieldCheck,
  Terminal,
  History,
  Sparkles,
  AlertTriangle,
  Play,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

// Client-side storage subscription for session ID
function getSessionSnapshot(): string {
  if (typeof window === "undefined") return "";
  let sid = localStorage.getItem("ai_reviewer_session_id");
  if (!sid) {
    sid = generateUUID();
    localStorage.setItem("ai_reviewer_session_id", sid);
  }
  return sid;
}

function getServerSnapshot(): string {
  return "";
}

function subscribeSession(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export default function Home() {
  const [code, setCode] = useState<string>(SAMPLE_SNIPPETS[0].code);
  const [language, setLanguage] = useState<string>(SAMPLE_SNIPPETS[0].language);
  const [selectedSnippetId, setSelectedSnippetId] = useState<string>(
    SAMPLE_SNIPPETS[0].id
  );

  const sessionId = React.useSyncExternalStore(
    subscribeSession,
    getSessionSnapshot,
    getServerSnapshot
  );

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<"issues" | "diff">("issues");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [highlightRange, setHighlightRange] = useState<HighlightRange | null>(
    null
  );

  // History state
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [historyReviews, setHistoryReviews] = useState<SavedReview[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(false);

  const { showToast } = useToast();

  // Fetch reviews for session
  const fetchHistory = useCallback(async () => {
    if (!sessionId) return;
    setIsHistoryLoading(true);
    try {
      const res = await fetch("/api/history", {
        headers: { "x-session-id": sessionId },
      });
      if (res.ok) {
        const data = await res.json();
        setHistoryReviews(data.reviews || []);
      }
    } catch (err) {
      console.warn("Failed to fetch history:", err);
    } finally {
      setIsHistoryLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    let isMounted = true;
    fetch("/api/history", {
      headers: { "x-session-id": sessionId },
    })
      .then((res) => (res.ok ? res.json() : { reviews: [] }))
      .then((data) => {
        if (isMounted) {
          setHistoryReviews(data.reviews || []);
        }
      })
      .catch((err) => console.warn(err));

    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  // Handle Preset Selection
  const handleSelectSnippet = (snippet: SampleSnippet) => {
    setCode(snippet.code);
    setLanguage(snippet.language);
    setSelectedSnippetId(snippet.id);
    setHighlightRange(null);
    showToast(`Loaded ${snippet.name} preset.`, "info");
  };

  // Perform Analysis
  const handleAnalyze = async () => {
    if (!code.trim()) {
      showToast("Please enter or paste code to analyze.", "warning");
      return;
    }
    if (code.length > 10000) {
      showToast("Code exceeds 10,000 character maximum limit.", "error");
      return;
    }

    setIsAnalyzing(true);
    setHighlightRange(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId,
        },
        body: JSON.stringify({
          code,
          language,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze code snippet.");
      }

      setAnalysisResult(data);
      setActiveTab("issues");
      setSelectedFilter("all");
      showToast("Audit completed successfully!", "success");

      // Refresh history sidebar
      fetchHistory();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error analyzing code.";
      showToast(message, "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Delete review
  const handleDeleteReview = async (id: string) => {
    try {
      const res = await fetch(`/api/history/${id}`, {
        method: "DELETE",
        headers: { "x-session-id": sessionId },
      });
      if (res.ok) {
        setHistoryReviews((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error("Delete review error:", err);
    }
  };

  // Reload past review from history
  const handleSelectReview = (review: SavedReview) => {
    setCode(review.code);
    setLanguage(review.language);
    setAnalysisResult(review.result);
    setActiveTab("issues");
    setSelectedFilter("all");
    setHighlightRange(null);
    setSelectedSnippetId("");
  };

  // Filter issues
  const filteredIssues = (analysisResult?.issues || []).filter((issue) => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === issue.severity) return true;
    if (selectedFilter === issue.category) return true;
    return false;
  });

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
      {/* Navigation Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base tracking-tight text-zinc-100">
                  AI Code Reviewer
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
                  Security Linter
                </span>
              </div>
              <p className="text-xs text-zinc-400 hidden sm:block">
                Instant OWASP audit, CWE vulnerability analysis & idiomatic refactoring
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* History drawer trigger button */}
            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 transition-colors"
            >
              <History className="w-4 h-4 text-emerald-400" />
              <span>History</span>
              {historyReviews.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                  {historyReviews.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Presets Bar */}
        <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80">
          <ExampleSelector
            onSelectSnippet={handleSelectSnippet}
            currentSnippetId={selectedSnippetId}
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Monaco Code Editor & Actions */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="h-[520px]">
              <CodeEditor
                code={code}
                onChange={(val) => {
                  setCode(val);
                  setSelectedSnippetId("");
                }}
                language={language}
                onLanguageChange={setLanguage}
                highlightRange={highlightRange}
              />
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Ready to audit</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleAnalyze}
                  isLoading={isAnalyzing}
                  disabled={isAnalyzing || !code.trim() || code.length > 10000}
                  variant="primary"
                  size="md"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Analyze Code</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column: Results Dashboard & Diff Viewer */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {/* View Mode Tabs */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("issues")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === "issues"
                      ? "bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  <span>Issues & Audit</span>
                  {analysisResult?.issues && (
                    <span className="px-1.5 py-0.2 rounded-full bg-zinc-700 text-zinc-300 text-[10px]">
                      {analysisResult.issues.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("diff")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === "diff"
                      ? "bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Refactored Code & Diff</span>
                </button>
              </div>

              {highlightRange && (
                <button
                  type="button"
                  onClick={() => setHighlightRange(null)}
                  className="text-[11px] text-zinc-400 hover:text-zinc-200"
                >
                  Clear Line Highlight
                </button>
              )}
            </div>

            {/* Results Display Area */}
            {isAnalyzing ? (
              <AnalysisSkeleton />
            ) : !analysisResult ? (
              /* Empty State */
              <div className="p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 text-center flex flex-col items-center justify-center min-h-[440px] space-y-4">
                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-emerald-400 shadow-inner">
                  <ShieldCheck className="w-12 h-12" />
                </div>
                <div className="max-w-md space-y-1.5">
                  <h3 className="text-base font-semibold text-zinc-200">
                    No Audit Run Yet
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Paste your code snippet or select one of the vulnerable preset examples above (SQL Injection, XSS, Command Injection, Inefficient Loops), then click{" "}
                    <strong className="text-emerald-400">Analyze Code</strong>.
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap gap-2 justify-center">
                  <button
                    type="button"
                    onClick={() => handleSelectSnippet(SAMPLE_SNIPPETS[0])}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors"
                  >
                    <span>Test SQL Injection</span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectSnippet(SAMPLE_SNIPPETS[5])}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors"
                  >
                    <span>Test Clean Code</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </button>
                </div>
              </div>
            ) : activeTab === "issues" ? (
              /* Issues Tab */
              <div className="space-y-4">
                <SummaryBanner
                  result={analysisResult}
                  selectedFilter={selectedFilter}
                  onSelectFilter={setSelectedFilter}
                />

                {filteredIssues.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                    <p className="text-sm font-semibold text-zinc-200">
                      No issues matching filter &quot;{selectedFilter}&quot;
                    </p>
                    <p className="text-xs text-zinc-400">
                      Try selecting another filter or &quot;All&quot;.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredIssues.map((issue) => (
                      <IssueCard
                        key={issue.id}
                        issue={issue}
                        isSelected={
                          highlightRange?.lineStart === issue.lineStart &&
                          highlightRange?.lineEnd === issue.lineEnd
                        }
                        onSelectLine={(start, end) =>
                          setHighlightRange({ lineStart: start, lineEnd: end })
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Refactored Diff Tab */
              <DiffViewer
                originalCode={code}
                refactoredCode={analysisResult.refactoredCode}
                refactorNotes={analysisResult.refactorNotes}
                language={language}
                onApplyRefactor={(newCode) => {
                  setCode(newCode);
                  setHighlightRange(null);
                }}
              />
            )}
          </div>
        </div>
      </main>

      {/* History Slide-over Drawer */}
      <HistorySidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        reviews={historyReviews}
        isLoading={isHistoryLoading}
        onSelectReview={handleSelectReview}
        onDeleteReview={handleDeleteReview}
      />

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-zinc-500">
          AI Code Reviewer & Security Linter • Designed for Student Developers & Security Education
        </div>
      </footer>
    </div>
  );
}
