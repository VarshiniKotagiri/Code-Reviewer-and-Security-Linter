import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "AI Code Reviewer & Security Linter",
  description:
    "Instant security audits, OWASP & CWE vulnerability detection, performance optimization, and idiomatic refactoring powered by Google Gemini.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
