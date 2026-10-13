"use client";

import React, { useRef, useEffect } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { Code2, Trash2 } from "lucide-react";

export interface HighlightRange {
  lineStart: number;
  lineEnd: number;
}

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  highlightRange?: HighlightRange | null;
  readOnly?: boolean;
}

const SUPPORTED_LANGUAGES = [
  { value: "auto", label: "Auto-detect" },
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C / C++" },
  { value: "php", label: "PHP" },
  { value: "sql", label: "SQL" },
  { value: "go", label: "Go" },
];

export function CodeEditor({
  code,
  onChange,
  language,
  onLanguageChange,
  highlightRange,
  readOnly = false,
}: CodeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Parameters<OnMount>[1] | null>(null);
  const decorationsRef = useRef<string[]>([]);

  const handleEditorDidMount: OnMount = (editorInstance, monaco) => {
    editorRef.current = editorInstance;
    monacoRef.current = monaco;

    // Configure editor visual options
    editorInstance.updateOptions({
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 13,
      lineHeight: 20,
      fontFamily: "'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
      tabSize: 2,
      smoothScrolling: true,
      cursorBlinking: "smooth",
      wordWrap: "on",
    });
  };

  // Update line decorations when highlightRange changes
  useEffect(() => {
    const editorInstance = editorRef.current;
    const monaco = monacoRef.current;

    if (!editorInstance || !monaco) return;

    if (highlightRange && highlightRange.lineStart > 0) {
      const { lineStart, lineEnd } = highlightRange;

      // Scroll to line
      editorInstance.revealLineInCenter(lineStart);

      // Apply line decoration
      const newDecorations = [
        {
          range: new monaco.Range(lineStart, 1, lineEnd, 1),
          options: {
            isWholeLine: true,
            className: "bg-red-500/20 border-l-4 border-red-500",
            glyphMarginClassName: "line-alert-glyph",
            linesDecorationsClassName: "line-alert-gutter",
          },
        },
      ];

      decorationsRef.current = editorInstance.deltaDecorations(
        decorationsRef.current,
        newDecorations
      );
    } else {
      // Clear decorations
      decorationsRef.current = editorInstance.deltaDecorations(
        decorationsRef.current,
        []
      );
    }
  }, [highlightRange]);

  const monacoLang =
    language === "auto"
      ? "plaintext"
      : language === "cpp"
      ? "cpp"
      : language;

  const charCount = code.length;
  const isOverLimit = charCount > 10000;

  return (
    <div className="flex flex-col h-full rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl overflow-hidden">
      {/* Editor Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-zinc-300">
            <Code2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold">Source Code</span>
          </div>

          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            disabled={readOnly}
            className="text-xs bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          {/* Character counter */}
          <span
            className={`text-xs font-mono ${
              isOverLimit
                ? "text-red-400 font-bold"
                : charCount > 8000
                ? "text-yellow-400"
                : "text-zinc-500"
            }`}
          >
            {charCount.toLocaleString()} / 10,000 chars
          </span>

          {/* Clear button */}
          {!readOnly && code.length > 0 && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-zinc-500 hover:text-red-400 p-1 transition-colors"
              title="Clear editor"
              aria-label="Clear code"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Monaco Container */}
      <div className="flex-1 min-h-[380px] w-full">
        <Editor
          height="100%"
          language={monacoLang}
          value={code}
          onChange={(val) => onChange(val || "")}
          theme="vs-dark"
          onMount={handleEditorDidMount}
          options={{
            readOnly,
          }}
          loading={
            <div className="flex items-center justify-center h-full text-xs text-zinc-500">
              Loading code editor...
            </div>
          }
        />
      </div>
    </div>
  );
}
